import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Post
from app.services.s3 import upload_image

# todas las rutas de aca van a empezar con /posts
posts_bp = Blueprint("posts", __name__, url_prefix="/posts")


# GET /posts → devuelve todos los posts ordenados por fecha
@posts_bp.route("", methods=["GET"])
def get_posts():
    # traigo todos los posts ordenados del mas nuevo al mas viejo
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts]), 200


# GET /posts/<id> → devuelve un post especifico por su ID
@posts_bp.route("/<int:post_id>", methods=["GET"])
def get_post(post_id):
    # busco el post por ID
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404
    return jsonify(post.to_dict()), 200


# POST /posts → crea un post nuevo
@posts_bp.route("", methods=["POST"])
@jwt_required()
def create_post():
    # obtengo el ID del usuario logueado desde el token
    current_user_id = int(get_jwt_identity())
    # uso request.form porque mandamos FormData desde el front
    data = request.form

    # verifico que esten los campos obligatorios
    if not data.get("title") or not data.get("description"):
        return jsonify({"error": "Titulo y descripcion son obligatorios"}), 400

    image_url = None

    # si el usuario mando una imagen, la subo a S3
    if "image" in request.files:
        file = request.files["image"]
        if file.filename != "":
            image_url = upload_image(file)

    # creo el post con los datos recibidos
    post = Post(
        title=data["title"],
        description=data["description"],
        category=data.get("category"),
        tags=data.get("tags"),
        image_url=image_url,
        user_id=current_user_id,
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(post.to_dict()), 201


# PUT /posts/<id> → actualiza un post existente
@posts_bp.route("/<int:post_id>", methods=["PUT"])
@jwt_required()
def update_post(post_id):
    # obtengo el ID del usuario logueado
    current_user_id = int(get_jwt_identity())

    # busco el post por ID
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    # verifico que el post le pertenezca al usuario logueado
    if post.user_id != current_user_id:
        return jsonify({"error": "No podés editar una publicación que no es tuya"}), 403

    data = request.get_json()

    # actualizo solo los campos que vinieron en el body
    if "title" in data:
        post.title = data["title"]
    if "description" in data:
        post.description = data["description"]
    if "category" in data:
        post.category = data["category"]
    if "image_url" in data:
        post.image_url = data["image_url"]
    if "status" in data:
        post.status = data["status"]
    if "resolved_location" in data:
        post.resolved_location = data["resolved_location"]
    if "resolved_instagram" in data:
        post.resolved_instagram = data["resolved_instagram"]
    if "resolved_link" in data:
        post.resolved_link = data["resolved_link"]

    db.session.commit()
    return jsonify(post.to_dict()), 200


# DELETE /posts/<id> → borra un post por su ID
@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    # obtengo el ID del usuario logueado
    current_user_id = int(get_jwt_identity())

    # busco el post por ID
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    # verifico que el post le pertenezca al usuario logueado
    if post.user_id != current_user_id:
        return jsonify({"error": "No podés borrar una publicación que no es tuya"}), 403

    # borro todos los comentarios del post antes de borrarlo
    from app.models import Comment
    Comment.query.filter_by(post_id=post_id).delete()

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": f"Publicación {post_id} eliminada"}), 200