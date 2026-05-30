import os
import json
import urllib.parse
from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authlib.integrations.flask_client import OAuth
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# instancia de OAuth, se inicializa con la app en __init__.py
oauth = OAuth()
google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


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


# GET /auth/google → redirige al login de Google
@auth_bp.route("/google", methods=["GET"])
def google_login():
    redirect_uri = "http://localhost:5001/auth/google/callback"
    return google.authorize_redirect(redirect_uri)


# GET /auth/google/callback → Google redirige acá con el code
@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    try:
        # intercambio el code por el token de Google
        token = google.authorize_access_token()
        user_info = token.get("userinfo")

        if not user_info or not user_info.get("email"):
            return redirect(f"{frontend_url}/login?error=no_email")

        email = user_info["email"]
        google_id = user_info["sub"]  # ID unico de Google
        name = user_info.get("name", email.split("@")[0])
        picture = user_info.get("picture")

        # busco si ya existe el usuario por google_id o por email
        user = User.query.filter_by(google_id=google_id).first()
        if not user:
            user = User.query.filter_by(email=email).first()

        if user:
            # usuario existente → actualizo su google_id si no lo tiene
            if not user.google_id:
                user.google_id = google_id
            if picture and not user.profile_picture:
                user.profile_picture = picture
            db.session.commit()
        else:
            # usuario nuevo → lo creo sin password
            username = name.replace(" ", "").lower()[:16]
            base_username = username
            counter = 1
            # si el username ya existe, le agrego un numero
            while User.query.filter_by(username=username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                email=email,
                username=username,
                google_id=google_id,
                profile_picture=picture,
            )
            db.session.add(user)
            db.session.commit()

        # genero el JWT propio igual que en el login normal
        jwt_token = create_access_token(identity=str(user.id))

        # redirigjo al front con el token y los datos del usuario en la URL
        user_data = urllib.parse.quote(json.dumps(user.to_dict()))
        return redirect(f"{frontend_url}/auth/callback?token={jwt_token}&user={user_data}")

    except Exception as e:
        print(f"Google OAuth error: {e}")
        return redirect(f"{frontend_url}/login?error=google_failed")