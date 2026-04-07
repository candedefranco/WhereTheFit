from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

# carga las variables del archivo .env (como la URL de la base de datos)
load_dotenv()

# creo la instancia de SQLAlchemy que vamos a usar en toda la app
db = SQLAlchemy()

# creo la instancia de Bcrypt para hashear contraseñas
bcrypt = Bcrypt()

# creo la instancia de JWTManager para manejar tokens
jwt = JWTManager()

def create_app():
    # creo la aplicacion Flask
    app = Flask(__name__)

    # aca lo q hace es decirle a Flask como conectarse a la base de datos
    # ponele que no encuentra URL en el .env, usa esta URL por defecto
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/wtf_db"
    )
    # desactivo una feature de SQLAlchemy que no necesito y consume memoria
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # clave secreta para firmar las sesiones de usuario
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    # configuro el token para que dure 1 dia
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

    # clave secreta para firmar los tokens JWT
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")


    # conecto SQLAlchemy y Bcrypt con nuestra app de Flask
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

    # registro las rutas de usuarios (los endpoints de /users)
    from app.routes.users import users_bp
    # registro las rutas de autenticacion (login/logout)
    from app.routes.auth import auth_bp
    # registro las rutas de publicaciones
    from app.routes.posts import posts_bp
    # registro las rutas de comentarios
    from app.routes.comments import comments_bp
    # registro las rutas de las paginas HTML
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)


    # creo las tablas en la base de datos si todavia no existen
    with app.app_context():
        db.create_all()

    return app


