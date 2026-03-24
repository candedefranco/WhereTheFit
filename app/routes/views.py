from flask import Blueprint, render_template

# blueprint para las rutas que devuelven paginas HTML
views_bp = Blueprint("views", __name__)


# GET / → pagina principal con la lista de usuarios
@views_bp.route("/")
def index():
    return render_template("index.html")


# GET /login → pagina de login
@views_bp.route("/login")
def login():
    return render_template("login.html")


# GET /create → pagina para crear usuario
@views_bp.route("/create")
def create():
    return render_template("create.html")


# GET /edit/<id> → pagina para editar usuario
@views_bp.route("/edit/<int:user_id>")
def edit(user_id):
    return render_template("edit.html", user_id=user_id)

# GET /profile → pagina del perfil del usuario logueado
@views_bp.route("/profile")
def profile():
    return render_template("profile.html")