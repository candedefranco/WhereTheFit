import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post
from app.services.s3 import upload_image

posts_bp = Blueprint("posts", __name__, url_prefix="/posts")


# GET /posts → devuelve todos los posts ordenados por fecha
@posts_bp.route("", methods=["GET"])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts]), 200


# POST /posts/suggest-tags → sugiere tags con Gemini (tiene que ir antes de /<int:post_id>)
@posts_bp.route("/suggest-tags", methods=["POST"])
@jwt_required()
def suggest_tags():
    if "image" not in request.files:
        return jsonify({"error": "Se requiere una imagen"}), 400

    file = request.files["image"]
    description = request.form.get("description", "")
    image_bytes = file.read()
    mime_type = file.content_type

    from app.services.gemini import suggest_tags as gemini_suggest
    tags = gemini_suggest(image_bytes, mime_type, description)

    return jsonify({"tags": tags}), 200


# GET /posts/user/<user_id> → devuelve todos los posts de un usuario
@posts_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_posts(user_id):
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts]), 200


# GET /posts/<id> → devuelve un post especifico por su ID
@posts_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404
    return jsonify(post.to_dict()), 200


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

        if "image" in request.files:
            file = request.files["image"]
            if file.filename != "":
                from app.models import PostImage
                PostImage.query.filter_by(post_id=post_id).delete()
                url = upload_image(file)
                new_image = PostImage(url=url, order=0, post_id=post_id)
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