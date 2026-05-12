from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Like, Post

# todas las rutas de aca van a empezar con /likes
likes_bp = Blueprint("likes", __name__, url_prefix="/likes")


# POST /likes/<post_id> → likear un post
@likes_bp.route("/<int:post_id>", methods=["POST"])
@jwt_required()
def like_post(post_id):
    current_user_id = int(get_jwt_identity())

    # verifico que el post exista
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Publicación no encontrada"}), 404

    # verifico que no lo haya likeado ya
    existing = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if existing:
        return jsonify({"error": "Ya likeaste esta publicación"}), 400

    like = Like(user_id=current_user_id, post_id=post_id)
    db.session.add(like)
    db.session.commit()

    return jsonify({"message": "Like agregado", "likes": Like.query.filter_by(post_id=post_id).count()}), 201


# DELETE /likes/<post_id> → sacar like de un post
@likes_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
def unlike_post(post_id):
    current_user_id = int(get_jwt_identity())

    like = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if not like:
        return jsonify({"error": "No likeaste esta publicación"}), 404

    db.session.delete(like)
    db.session.commit()

    return jsonify({"message": "Like eliminado", "likes": Like.query.filter_by(post_id=post_id).count()}), 200


# GET /likes/<post_id> → cantidad de likes de un post
@likes_bp.route("/<int:post_id>", methods=["GET"])
def get_likes(post_id):
    likes = Like.query.filter_by(post_id=post_id).count()
    return jsonify({"likes": likes}), 200