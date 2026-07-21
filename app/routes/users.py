import os
import secrets
from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.services.email import send_notification_email

# el blueprint es una forma de agrupar rutas relacionadas
# todas las rutas de aca van a empezar con /users
users_bp = Blueprint("users", __name__, url_prefix="/users")


# POST /users → crea un usuario nuevo
@users_bp.route("", methods=["POST"])
def create_user():
    # leo el JSON que mando el cliente en el body de la request
    data = request.get_json()

    # verifico que esten todos los campos obligatorios
    required = ["username", "email", "password"]
    if not all(field in data for field in required):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    # verifico que el username no este en uso
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "El username ya esta en uso"}), 400

    # lo mismo con el mail
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "El email ya esta registrado"}), 400

    # creo el objeto User con los datos recibidos
    user = User(
        username=data["username"],
        email=data["email"],
        profile_picture=data.get("profile_picture"),  # opcional
    )
    user.set_password(data["password"])

    # agrego el usuario a la sesion y lo guardo en la base de datos
    db.session.add(user)
    db.session.commit()

    # genero token de verificación y envío el email automáticamente
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    db.session.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{frontend_url}/verify-email?token={token}"

    html_body = render_template(
        "verification_email.html",
        username=user.username,
        verification_link=verification_link,
        frontend_url=frontend_url,
    )

    send_notification_email(user.email, "Verificá tu cuenta en WhereTheFit", html_body)

    # devuelvo el usuario creado con codigo 201 (created)
    return jsonify(user.to_dict()), 201


# GET /users → devuelve todos los usuarios
@users_bp.route("", methods=["GET"])
def get_users():
    # traigo todos los usuarios de la base de datos
    users = User.query.all()

    # convierto cada usuario a dicc y los devuelvo como lista
    return jsonify([u.to_dict() for u in users]), 200


# GET /users/<id> → devuelve un usuario especifico por su ID
@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    # busco el usuario por ID
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.to_dict()), 200


# PUT /users/<id> → actualiza un usuario existente
@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    # obtengo el ID del usuario del token JWT
    current_user_id = int(get_jwt_identity())

    # verifico que el usuario solo pueda editar su propio perfil
    if current_user_id != user_id:
        return jsonify({"error": "No podés editar el perfil de otro usuario"}), 403

    # busco el usuario por ID
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # detecto si viene como FormData (con archivo) o JSON
    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form

        # si viene una foto como archivo, la subo a S3
        if "profile_picture_file" in request.files:
            file = request.files["profile_picture_file"]
            if file.filename != "":
                from app.services.s3 import upload_image
                url = upload_image(file)
                user.profile_picture = url
    else:
        data = request.get_json()

        if "profile_picture" in data:
            user.profile_picture = data["profile_picture"]

    # actualizo solo los campos que vinieron en el body
    if "username" in data:
        existing = User.query.filter_by(username=data["username"]).first()
        if existing and existing.id != user_id:
            return jsonify({"error": "El username ya esta en uso"}), 400
        user.username = data["username"]

    if "email" in data:
        existing = User.query.filter_by(email=data["email"]).first()
        if existing and existing.id != user_id:
            return jsonify({"error": "El email ya esta registrado"}), 400
        user.email = data["email"]

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    # activa o desactiva el envio del resumen diario por mail
    if "email_notifications" in data:
        user.email_notifications = data["email_notifications"] in [True, "true", "True"]

    # guardo los cambios en la base de datos
    db.session.commit()
    return jsonify(user.to_dict()), 200


# DELETE /users/<id> → borra un usuario por su ID
@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    # obtengo el ID del usuario del token JWT
    current_user_id = int(get_jwt_identity())

    # verifico que solo pueda borrar su propia cuenta
    if current_user_id != user_id:
        return jsonify({"error": "No podés borrar el perfil de otro usuario"}), 403

    # busco el usuario por ID
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # borro el usuario y guardo el cambio
    db.session.delete(user)
    db.session.commit()

    # devuelvo un mensaje confirmando el delete
    return jsonify({"message": f"Usuario {user_id} eliminado"}), 200