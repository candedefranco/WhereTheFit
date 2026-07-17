import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post
from app.services.s3 import upload_image

posts_bp = Blueprint("posts", __name__, url_prefix="/posts")


# GET /posts → devuelve todos los posts, con filtros opcionales
@posts_bp.route("", methods=["GET"])
def get_posts():
    query = Post.query

    # filtro por categoria
    category = request.args.get("category")
    if category:
        query = query.filter(Post.category.ilike(f"%{category}%"))

    # filtro por tags
    tag = request.args.get("tag")
    if tag:
        query = query.filter(Post.tags.ilike(f"%{tag}%"))

    # filtro por texto libre en titulo o descripcion
    search = request.args.get("search")
    if search:
        query = query.filter(
            db.or_(
                Post.title.ilike(f"%{search}%"),
                Post.description.ilike(f"%{search}%")
            )
        )

    # filtro por estado
    status = request.args.get("status")
    if status:
        query = query.filter(Post.status == status)

    # paginacion
    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)

    query = query.order_by(Post.created_at.desc())
    total = query.count()
    posts = query.offset(offset).limit(limit).all()
    return jsonify({"items": [p.to_dict() for p in posts], "total": total}), 200


# POST /posts/suggest-tags → sugiere tags con Gemini (tiene que ir antes de /<int:post_id>)
@posts_bp.route("/suggest-tags", methods=["POST"])
@jwt_required()
def suggest_tags():
    description = request.form.get("description", "")

    if "image" in request.files and request.files["image"].filename != "":
        file = request.files["image"]
        image_bytes = file.read()
        mime_type = file.content_type
    elif request.form.get("image_url"):
        import urllib.request
        url = request.form["image_url"]
        with urllib.request.urlopen(url) as r:
            image_bytes = r.read()
            mime_type = r.headers.get_content_type() or "image/jpeg"
    else:
        return jsonify({"error": "Se requiere una imagen"}), 400

    from app.services.gemini import suggest_tags as gemini_suggest
    tags = gemini_suggest(image_bytes, mime_type, description)

    return jsonify({"tags": tags}), 200


# GET /posts/user/<user_id> → devuelve todos los posts de un usuario
@posts_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_posts(user_id):
    limit = request.args.get("limit", 10, type=int)
    offset = request.args.get("offset", 0, type=int)
    query = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc())
    total = query.count()
    posts = query.offset(offset).limit(limit).all()
    return jsonify({"items": [p.to_dict() for p in posts], "total": total}), 200

# GET /posts/for-you → devuelve posts relevantes basados en los likes del usuario
@posts_bp.route("/for-you", methods=["GET"])
@jwt_required()
def get_for_you():
    current_user_id = int(get_jwt_identity())
    from app.models import Like

    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)

    # traigo los posts que likeo el usuario
    liked_posts = db.session.query(Post).join(Like).filter(
        Like.user_id == current_user_id
    ).all()

    if not liked_posts:
        # si no likeó nada, devuelvo el feed general
        query = Post.query.order_by(Post.created_at.desc())
        total = query.count()
        posts = query.offset(offset).limit(limit).all()
        return jsonify({"items": [p.to_dict() for p in posts], "total": total}), 200

    # extraigo categorias y tags de los posts likeados
    categories = set()
    tags = set()
    for post in liked_posts:
        if post.category:
            categories.add(post.category)
        if post.tags:
            for tag in post.tags.split(","):
                tags.add(tag.strip().lower())

    # busco posts similares que no sean del usuario y no haya likeado ya
    liked_post_ids = [p.id for p in liked_posts]
    query = Post.query.filter(
        Post.user_id != current_user_id,
        ~Post.id.in_(liked_post_ids)
    )

    # filtro por categoria o tags similares
    filters = []
    for category in categories:
        filters.append(Post.category.ilike(f"%{category}%"))
    for tag in tags:
        filters.append(Post.tags.ilike(f"%{tag}%"))

    if filters:
        query = query.filter(db.or_(*filters))

    query = query.order_by(Post.created_at.desc())
    total = query.count()
    posts = query.offset(offset).limit(limit).all()

    # si no hay resultados, devuelvo el feed general
    if not posts and offset == 0:
        query = Post.query.filter(
            Post.user_id != current_user_id
        ).order_by(Post.created_at.desc())
        total = query.count()
        posts = query.offset(offset).limit(limit).all()

    return jsonify({"items": [p.to_dict() for p in posts], "total": total}), 200

# GET /posts/nearby?lat=...&lng=...&km=...
@posts_bp.route("/nearby", methods=["GET"])
def get_nearby_posts():
    try:
        user_lat = float(request.args.get("lat"))
        user_lng = float(request.args.get("lng"))
        km = float(request.args.get("km", 10))
    except (TypeError, ValueError):
        return jsonify({"error": "lat, lng y km son requeridos y deben ser números"}), 400

    sql = db.text("""
        SELECT id FROM posts
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND 6371 * acos(
            cos(radians(:lat)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(latitude))
        ) <= :km
    """)

    result = db.session.execute(sql, {"lat": user_lat, "lng": user_lng, "km": km})
    post_ids = [row[0] for row in result]

    limit = request.args.get("limit", 20, type=int)
    offset = request.args.get("offset", 0, type=int)

    query = Post.query.filter(Post.id.in_(post_ids)).order_by(Post.created_at.desc())
    total = query.count()
    posts = query.offset(offset).limit(limit).all()
    return jsonify({"items": [p.to_dict() for p in posts], "total": total}), 200

# GET /posts/<id> → devuelve un post especifico por su ID
@posts_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404
    return jsonify(post.to_dict()), 200


# GET /posts/<id>/similar-links → sugiere links de tiendas con prendas similares usando IA
@posts_bp.route("/<int:post_id>/similar-links", methods=["GET"])
@jwt_required()
def get_similar_links(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    # si el post tiene imagen, la descargo para mandarla a Gemini
    image_bytes = None
    mime_type = None
    from app.models import PostImage
    first_image = PostImage.query.filter_by(post_id=post_id).order_by(PostImage.order).first()
    if first_image:
        try:
            import urllib.request
            with urllib.request.urlopen(first_image.url) as r:
                image_bytes = r.read()
                mime_type = r.headers.get_content_type() or "image/jpeg"
        except Exception:
            pass  # si falla la descarga, seguimos sin imagen

    from app.services.gemini import suggest_similar_links
    links = suggest_similar_links(
        title=post.title,
        description=post.description,
        tags=post.tags or "",
        category=post.category or "",
        image_bytes=image_bytes,
        mime_type=mime_type,
    )

    return jsonify({"links": links}), 200


# POST /posts → crea un post nuevo
@posts_bp.route("", methods=["POST"])
@jwt_required()
def create_post():
    current_user_id = int(get_jwt_identity())
    data = request.form

    if not data.get("title") or not data.get("description"):
        return jsonify({"error": "Titulo y descripcion son obligatorios"}), 400

    post = Post(
        title=data["title"],
        description=data["description"],
        category=data.get("category"),
        tags=data.get("tags"),
        user_id=current_user_id,
        latitude=data.get("latitude", type=float),
        longitude=data.get("longitude", type=float),
    )

    db.session.add(post)
    db.session.flush()

    from app.models import PostImage
    files = request.files.getlist("images")
    for i, file in enumerate(files[:3]):
        if file.filename != "":
            url = upload_image(file)
            image = PostImage(url=url, order=i, post_id=post.id)
            db.session.add(image)

    db.session.commit()
    return jsonify(post.to_dict()), 201


# PUT /posts/<id> → actualiza un post existente
@posts_bp.route("/<int:post_id>", methods=["PUT"])
@jwt_required()
def update_post(post_id):
    current_user_id = int(get_jwt_identity())

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    if post.user_id != current_user_id:
        return jsonify({"error": "No podés editar una publicación que no es tuya"}), 403

    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form

        # soporte para multiples imagenes (igual que en create)
        files = request.files.getlist("images")
        if files and files[0].filename != "":
            from app.models import PostImage
            PostImage.query.filter_by(post_id=post_id).delete()
            for i, file in enumerate(files[:3]):
                if file.filename != "":
                    url = upload_image(file)
                    new_image = PostImage(url=url, order=i, post_id=post_id)
                    db.session.add(new_image)
    else:
        data = request.get_json()

    if "title" in data:
        post.title = data["title"]
    if "description" in data:
        post.description = data["description"]
    if "category" in data:
        post.category = data["category"]
    if "status" in data:
        post.status = data["status"]
    if "tags" in data:
        post.tags = data["tags"]
    if "resolved_location" in data:
        post.resolved_location = data["resolved_location"]
    if "resolved_instagram" in data:
        post.resolved_instagram = data["resolved_instagram"]
    if "resolved_link" in data:
        if data["resolved_link"] and not re.match(r'^https://.+', data["resolved_link"]):
            return jsonify({"error": "El link debe empezar con https://"}), 400
        post.resolved_link = data["resolved_link"]

    db.session.commit()
    return jsonify(post.to_dict()), 200


# DELETE /posts/<id> → borra un post por su ID
@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    current_user_id = int(get_jwt_identity())

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    if post.user_id != current_user_id:
        return jsonify({"error": "No podés borrar una publicación que no es tuya"}), 403

    from app.models import Comment, PostImage
    PostImage.query.filter_by(post_id=post_id).delete()
    Comment.query.filter_by(post_id=post_id).delete()

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": f"Publicación {post_id} eliminada"}), 200