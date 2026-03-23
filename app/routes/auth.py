from flask import Blueprint, request, jsonify, session
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# POST /auth/login → recibe email y password, inicia sesion
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    # verifico que vengan email y password
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    # busco el usuario por email
    user = User.query.filter_by(email=data["email"]).first()

    # verifico que el usuario exista y que la contraseña sea correcta
    if not user or not bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    # guardo el ID del usuario en la sesion
    session["user_id"] = user.id

    return jsonify({"message": "Login exitoso", "user": user.to_dict()}), 200


# POST /auth/logout → cierra la sesion
@auth_bp.route("/logout", methods=["POST"])
def logout():
    # borro la sesion
    session.clear()
    return jsonify({"message": "Logout exitoso"}), 200


# GET /auth/me → devuelve el usuario logueado
@auth_bp.route("/me", methods=["GET"])
def me():
    # verifico que haya un usuario en sesion
    if "user_id" not in session:
        return jsonify({"error": "No hay sesión activa"}), 401

    user = db.session.get(User, session["user_id"])
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user.to_dict()), 200