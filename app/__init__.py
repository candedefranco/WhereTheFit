from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# carga las variables del archivo .env (como la URL de la base de datos)
load_dotenv()

# creo la instancia de SQLAlchemy que vamos a usar en toda la app
db = SQLAlchemy()

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

    # conecto SQLAlchemy con nuestra app de Flask
    db.init_app(app)

    # registro las rutas de usuarios (los endpoints de /users)
    from app.routes.users import users_bp
    app.register_blueprint(users_bp)

    # creo las tablas en la base de datos si todavia no existen
    with app.app_context():
        db.create_all()

    return app