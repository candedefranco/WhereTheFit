import os
import json
import secrets
import urllib.parse
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, redirect, render_template
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authlib.integrations.flask_client import OAuth
from app import db, bcrypt
from app.models import User
from app.services.email import send_notification_email

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

    # si el usuario existe pero se registró solo con Google (sin password)
    if user and user.password is None:
        return jsonify({"error": "google_only"}), 403

    # verifico que el usuario exista y que la contraseña sea correcta
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    # si el usuario no verificó su email y no es de Google, bloqueo el login
    if not user.email_verified and not user.google_id:
        return jsonify({"error": "email_not_verified", "email": user.email}), 403

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


# POST /auth/set-password → permite a usuarios de Google configurar una contraseña
@auth_bp.route("/set-password", methods=["POST"])
def set_password():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contraseña requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    user.set_password(password)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Contraseña configurada", "user": user.to_dict(), "token": token}), 200


# POST /auth/send-verification → envía (o reenvía) el email de verificación
@auth_bp.route("/send-verification", methods=["POST"])
def send_verification():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email requerido"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # genero un token seguro y lo guardo en el usuario
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    db.session.commit()

    # armo el link de verificación que apunta al frontend
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{frontend_url}/verify-email?token={token}"

    # renderizo el template HTML del email de verificación
    html_body = render_template(
        "verification_email.html",
        username=user.username,
        verification_link=verification_link,
        frontend_url=frontend_url,
    )

    # envío el email
    send_notification_email(user.email, "Verificá tu cuenta en WhereTheFit", html_body)

    return jsonify({"message": "Email de verificación enviado"}), 200


# GET /auth/verify-email → verifica el token y activa la cuenta
@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token")

    if not token:
        return jsonify({"error": "Token requerido"}), 400

    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"error": "Token inválido o expirado"}), 400

    # marco el email como verificado y limpio el token
    user.email_verified = True
    user.verification_token = None
    db.session.commit()

    return jsonify({"message": "Email verificado"}), 200


# POST /auth/forgot-password → envía email para resetear contraseña
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email requerido"}), 400

    user = User.query.filter_by(email=email).first()

    # si el usuario existe, genero el token y mando el mail
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={token}"

        html_body = render_template(
            "reset_password_email.html",
            username=user.username,
            reset_link=reset_link,
            frontend_url=frontend_url,
        )

        send_notification_email(user.email, "Restablecé tu contraseña en WhereTheFit", html_body)

    # siempre devuelvo el mismo mensaje para no revelar si el email existe
    return jsonify({"message": "Si el email existe, te mandamos instrucciones"}), 200


# POST /auth/reset-password → cambia la contraseña con el token
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    password = data.get("password")

    if not token or not password:
        return jsonify({"error": "Token y contraseña requeridos"}), 400

    user = User.query.filter_by(reset_token=token).first()

    # verifico que el token exista y no haya expirado
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({"error": "Token inválido o expirado"}), 400

    # cambio la contraseña y limpio los campos de reset
    user.set_password(password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada"}), 200


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
            # si se logueó con Google, el email queda verificado
            if not user.email_verified:
                user.email_verified = True
            db.session.commit()
        else:
            # usuario nuevo → lo creo sin password, con email_verified=True
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
                email_verified=True,
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
