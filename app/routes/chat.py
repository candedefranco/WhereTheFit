from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Follow, User, Message

# todas las rutas de aca van a empezar con /chat
chat_bp = Blueprint("chat", __name__, url_prefix="/chat")


# GET /chat/mutuals → lista de mutuals (usuarios que se siguen mutuamente)
@chat_bp.route("/mutuals", methods=["GET"])
@jwt_required()
def get_mutuals():
    current_user_id = int(get_jwt_identity())

    # busco los usuarios que yo sigo
    following = db.session.query(Follow.followed_id).filter_by(follower_id=current_user_id).subquery()

    # busco los usuarios que me siguen a mi Y que yo tambien sigo (mutuals)
    mutuals = (
        db.session.query(User)
        .join(Follow, Follow.follower_id == User.id)
        .filter(Follow.followed_id == current_user_id)
        .filter(User.id.in_(following))
        .all()
    )

    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "profile_picture": u.profile_picture,
        }
        for u in mutuals
    ]), 200


# GET /chat/messages/<user_id> → mensajes entre el usuario logueado y user_id
@chat_bp.route("/messages/<int:user_id>", methods=["GET"])
@jwt_required()
def get_messages(user_id):
    current_user_id = int(get_jwt_identity())

    # parametros de paginacion
    limit = request.args.get("limit", type=int, default=50)
    offset = request.args.get("offset", type=int, default=0)

    # busco los mensajes entre ambos usuarios, ordenados por fecha ASC
    messages = (
        Message.query.filter(
            db.or_(
                db.and_(Message.sender_id == current_user_id, Message.receiver_id == user_id),
                db.and_(Message.sender_id == user_id, Message.receiver_id == current_user_id),
            )
        )
        .order_by(Message.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return jsonify([m.to_dict() for m in messages]), 200


# DELETE /chat/messages/<message_id> → borra un mensaje propio
@chat_bp.route("/messages/delete/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    current_user_id = int(get_jwt_identity())

    message = db.session.get(Message, message_id)
    if not message:
        return jsonify({"error": "Mensaje no encontrado"}), 404

    # solo el sender puede borrar su mensaje
    if message.sender_id != current_user_id:
        return jsonify({"error": "No podés borrar un mensaje que no es tuyo"}), 403

    db.session.delete(message)
    db.session.commit()
    return jsonify({"message": "Mensaje eliminado", "id": message_id}), 200


# PUT /chat/messages/<message_id> → edita un mensaje propio
@chat_bp.route("/messages/edit/<int:message_id>", methods=["PUT"])
@jwt_required()
def edit_message(message_id):
    current_user_id = int(get_jwt_identity())

    message = db.session.get(Message, message_id)
    if not message:
        return jsonify({"error": "Mensaje no encontrado"}), 404

    if message.sender_id != current_user_id:
        return jsonify({"error": "No podés editar un mensaje que no es tuyo"}), 403

    data = request.get_json()
    new_text = data.get("text", "").strip()
    if not new_text:
        return jsonify({"error": "El mensaje no puede estar vacío"}), 400

    message.text = new_text
    db.session.commit()
    return jsonify(message.to_dict()), 200
