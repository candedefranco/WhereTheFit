from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# POST /auth/login → recibe email y password, devuelve un token JWT
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    # verifico que vengan email y password
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    # busco el usuario por email
    user = User.query.filter_by(email=data["email"]).first()

    # verifico que el usuario exista y que la contraseña sea correcta
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    # genero el token JWT con el ID del usuario adentro
    token = create_access_token(identity=str(user.id))

    return jsonify({"message": "Login exitoso", "user": user.to_dict(), "token": token}), 200


# POST /auth/logout → con JWT el logout lo maneja el front borrando el token
@auth_bp.route("/logout", methods=["POST"])
def logout():
    # con JWT no hay sesion en el servidor, el front simplemente borra el token
    return jsonify({"message": "Logout exitoso"}), 200


# GET /auth/me → devuelve el usuario logueado (requiere token valido)
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    # obtengo el ID del usuario del token
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.to_dict()), 200