from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Follow, User

# todas las rutas de aca van a empezar con /follows
follows_bp = Blueprint("follows", __name__, url_prefix="/follows")


# POST /follows/<user_id> → seguir a un usuario
@follows_bp.route("/<int:user_id>", methods=["POST"])
@jwt_required()
def follow_user(user_id):
    current_user_id = int(get_jwt_identity())

    # no puedo seguirme a mi mismo
    if current_user_id == user_id:
        return jsonify({"error": "No podés seguirte a vos mismo"}), 400

    # verifico que el usuario a seguir exista
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # verifico que no lo este siguiendo ya
    existing = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if existing:
        return jsonify({"error": "Ya seguís a este usuario"}), 400

    # creo el follow
    follow = Follow(follower_id=current_user_id, followed_id=user_id)
    db.session.add(follow)
    db.session.commit()

    return jsonify({"message": "Ahora seguís a este usuario"}), 201


# DELETE /follows/<user_id> → dejar de seguir a un usuario
@follows_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = int(get_jwt_identity())

    # busco el follow
    follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    if not follow:
        return jsonify({"error": "No seguís a este usuario"}), 404

    db.session.delete(follow)
    db.session.commit()

    return jsonify({"message": "Dejaste de seguir a este usuario"}), 200


# GET /follows/<user_id>/is-following → indica si el usuario logueado sigue a este usuario
@follows_bp.route("/<int:user_id>/is-following", methods=["GET"])
@jwt_required()
def is_following(user_id):
    current_user_id = int(get_jwt_identity())

    follow = Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first()
    return jsonify({"is_following": follow is not None}), 200


# GET /follows/<user_id>/followers?limit=10&offset=0 → lista paginada de seguidores
@follows_bp.route("/<int:user_id>/followers", methods=["GET"])
def get_followers(user_id):
    # parametros de paginacion, con valores por defecto
    limit = request.args.get("limit", type=int, default=10)
    offset = request.args.get("offset", type=int, default=0)

    query = Follow.query.filter_by(followed_id=user_id)

    # cuento el total antes de paginar, para que el front sepa si hay mas para cargar
    total = query.count()

    follows = query.order_by(Follow.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "items": [{
            "id": f.follower.id,
            "username": f.follower.username,
            "profile_picture": f.follower.profile_picture,
        } for f in follows],
        "total": total,
    }), 200


# GET /follows/<user_id>/following?limit=10&offset=0 → lista paginada de seguidos
@follows_bp.route("/<int:user_id>/following", methods=["GET"])
def get_following(user_id):
    # parametros de paginacion, con valores por defecto
    limit = request.args.get("limit", type=int, default=10)
    offset = request.args.get("offset", type=int, default=0)

    query = Follow.query.filter_by(follower_id=user_id)

    # cuento el total antes de paginar, para que el front sepa si hay mas para cargar
    total = query.count()

    follows = query.order_by(Follow.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        "items": [{
            "id": f.followed.id,
            "username": f.followed.username,
            "profile_picture": f.followed.profile_picture,
        } for f in follows],
        "total": total,
    }), 200