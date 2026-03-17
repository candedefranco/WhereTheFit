from flask import Blueprint, request, jsonify
from app import db
from app.models import User

# el blueprint es una forma de agrupar rutas relacionadas
# todas las rutas de aca van a empezar con /users
users_bp = Blueprint("users", __name__, url_prefix="/users")


# POST /users → crea un usuario nuevo
@users_bp.route("", methods=["POST"])
def create_user():
    # leo el JSON que mando el cliente en el body de la request
    data = request.get_json()

    # veriico que estén todos los campos obligatorios
    required = ["username", "email", "password"]
    if not all(field in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    # verifico que el username no este en uso
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already taken"}), 400

    # lo mismo con el mail
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    # creo el objeto User con los datos recibidos
    user = User(
        username=data["username"],
        email=data["email"],
        password=data["password"],
        profile_picture=data.get("profile_picture"), #opcional
    )
    # agrego el usuario a la sesion y lo guardo en la base de datos
    db.session.add(user)
    db.session.commit()

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
    # Buscamos el usuario por ID
    user = db.session.get(User, user_id)
    # si no existe, devuelvo error 404
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

# PUT /users/<id> → actualiza un usuario existente
@users_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    # busco el usuario por ID
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # actualizo solo los campos que vinieron en el body
    # si no viene un campo, lo dejo como estaba
    if "username" in data:
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username already taken"}), 400
        user.username = data["username"]

    if "email" in data:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already registered"}), 400
        user.email = data["email"]

    if "password" in data:
        user.password = data["password"]

    if "profile_picture" in data:
        user.profile_picture = data["profile_picture"]

    # guardo los cambios en la base de datos
    db.session.commit()
    return jsonify(user.to_dict()), 200

# DELETE /users/<id> → borra un usuario por su ID
@users_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    # busca el usuario por ID
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # se borra el usuario y se guarda el cambio
    db.session.delete(user)
    db.session.commit()

    # devuelve un mensaje confirmando el delete
    return jsonify({"message": f"User {user_id} deleted"}), 200