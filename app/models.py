from app import db, bcrypt

# esta clase representa la tabla "users" en la base de datos
# cada atributo es una columna de la tabla
class User(db.Model):
    __tablename__ = "users"

    # id unico que se genera automaticamente para cada usuario
    id = db.Column(db.Integer, primary_key=True)

    # nombre de usuario, no puede repetirse ni estar vacio
    username = db.Column(db.String(80), unique=True, nullable=False)

    # email, tampoco puede repetirse ni estar vacio
    email = db.Column(db.String(120), unique=True, nullable=False)

    # contraseña hasheada, no puede estar vacia
    password = db.Column(db.String(255), nullable=False)

    # foto de perfil, es opcional
    profile_picture = db.Column(db.String(255), nullable=True)

    # fecha y hora de creacion, se llena sola cuando se crea el usuario
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def set_password(self, password):
        # hasheo la contraseña antes de guardarla
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        # verifico si la contraseña ingresada coincide con el hash guardado
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self):
        # convierto el objeto User a diccionario para devolverlo como JSON
        # no incluyo la contraseña por seguridad
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat(),
        }