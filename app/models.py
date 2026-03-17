from app import db

# esta clase representa la tabla "users" en la base de datos
# cada atributo es una columna de la tabla

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True) #id unico que se genera automaticamente para cada usuario
    username = db.Column(db.String(80), unique=True, nullable=False) #nombre de usuario, no puede repetirse ni estar vacio
    email = db.Column(db.String(120), unique=True, nullable=False) #email, lo mismo que arriba
    password = db.Column(db.String(255), nullable=False) #contraseña, no puede estar vacia
    profile_picture = db.Column(db.String(255), nullable=True) #foto de perfil, opcional
    created_at = db.Column(db.DateTime, server_default=db.func.now()) #fecha y hr de creacion, es automatico cuando se crea el usuario

    def to_dict(self):
        # convierte el objeto user a un diccionario para poder devolverlo como JSON
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat(),
        }