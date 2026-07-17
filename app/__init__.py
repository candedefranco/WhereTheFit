from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
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

# creo la instancia de Mail de manera global
mail = Mail()

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

    # configuro el flask-mail
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # conecto SQLAlchemy y Bcrypt con nuestra app de Flask
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # registro las rutas de autenticacion con Google
    from app.routes.auth import oauth
    oauth.init_app(app)

    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"], expose_headers=["Authorization"])

    # registro las rutas de usuarios (los endpoints de /users)
    from app.routes.users import users_bp
    # registro las rutas de autenticacion (login/logout)
    from app.routes.auth import auth_bp
    # registro las rutas de publicaciones
    from app.routes.posts import posts_bp
    # registro las rutas de comentarios
    from app.routes.comments import comments_bp
    # registro las rutas de los follows
    from app.routes.follows import follows_bp
    # registro las rutas de los likes
    from app.routes.likes import likes_bp
    # registro las rutas del chat
    from app.routes.chat import chat_bp

    # registro las rutas de las paginas HTML
    app.register_blueprint(users_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(follows_bp)
    app.register_blueprint(likes_bp)
    app.register_blueprint(chat_bp)



    # creo las tablas en la base de datos si todavia no existen
    with app.app_context():
        db.create_all()

    # inicializo el scheduler evitando duplicados por el reloader
    if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        from app.jobs.daily_email import init_scheduler
        init_scheduler(app)

    return app


