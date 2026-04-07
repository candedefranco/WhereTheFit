from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Comment

# todas las rutas de aca van a empezar con /comments
comments_bp = Blueprint("comments", __name__, url_prefix="/comments")


# GET /comments/<post_id> → devuelve todos los comentarios de un post
@comments_bp.route("/<int:post_id>", methods=["GET"])
def get_comments(post_id):
    # traigo todos los comentarios del post ordenados del mas viejo al mas nuevo
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments]), 200


# POST /comments/<post_id> → agrega un comentario a un post
@comments_bp.route("/<int:post_id>", methods=["POST"])
@jwt_required()
def create_comment(post_id):
    # obtengo el ID del usuario logueado desde el token
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    # verifico que venga el texto del comentario
    if not data.get("text"):
        return jsonify({"error": "El comentario no puede estar vacío"}), 400

    # creo el comentario
    comment = Comment(
        text=data["text"],
        link=data.get("link"),
        post_id=post_id,
        user_id=current_user_id,
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(comment.to_dict()), 201


# DELETE /comments/<id> → borra un comentario
@comments_bp.route("/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    # obtengo el ID del usuario logueado
    current_user_id = int(get_jwt_identity())

    # busco el comentario por ID
    comment = db.session.get(Comment, comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado"}), 404

    # verifico que el comentario le pertenezca al usuario logueado
    if comment.user_id != current_user_id:
        return jsonify({"error": "No podés borrar un comentario que no es tuyo"}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": f"Comentario {comment_id} eliminado"}), 200