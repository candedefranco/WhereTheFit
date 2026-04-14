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


class Post(db.Model):
    __tablename__ = "posts"

    # id unico que se genera automaticamente para cada post
    id = db.Column(db.Integer, primary_key=True)

    # titulo de la publicacion
    title = db.Column(db.String(200), nullable=False)

    # descripcion detallada de la prenda buscada
    description = db.Column(db.Text, nullable=False)

    # categoria de la prenda (ej: pantalones, camperas)
    category = db.Column(db.String(100), nullable=True)

    # imagen de referencia (url)
    image_url = db.Column(db.String(500), nullable=True)

    # tags para busqueda (ej: campera, vintage, streetwear)
    tags = db.Column(db.Text, nullable=True)

    # estado del post: active o resolved
    status = db.Column(db.String(20), nullable=False, default="active")

    # fecha de creacion, se llena sola
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # id del usuario que creo el post (foreign key)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # relacion con el modelo User
    user = db.relationship("User", backref="posts")

    def to_dict(self):
        # convierto el objeto Post a diccionario para devolverlo como JSON
        return {
                "id": self.id,
                "title": self.title,
                "description": self.description,
                "category": self.category,
                "image_url": self.image_url,
                "status": self.status,
                "created_at": self.created_at.isoformat(),
                "user_id": self.user_id,
                "username": self.user.username,
                "tags": self.tags.split(",") if self.tags else [],
        }


class Comment(db.Model):
    __tablename__ = "comments"

    # id unico que se genera automaticamente para cada comentario
    id = db.Column(db.Integer, primary_key=True)

    # texto del comentario
    text = db.Column(db.Text, nullable=False)

    # links opcionales que puede agregar el usuario
    link = db.Column(db.String(500), nullable=True)

    # fecha de creacion, se llena sola
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # id del post al que pertenece el comentario
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    # id del usuario que hizo el comentario
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # referencia al comentario padre (si es una respuesta a otro comentario)
    parent_id = db.Column(db.Integer, db.ForeignKey("comments.id"), nullable=True)

    # relacion con el comentario padre
    replies = db.relationship("Comment", backref=db.backref("parent", remote_side=[id]))

    # relaciones con Post y User
    post = db.relationship("Post", backref="comments")
    user = db.relationship("User", backref="comments")

    def to_dict(self):
        # convierto el objeto Comment a diccionario para devolverlo como JSON
        return {
            "id": self.id,
            "text": self.text,
            "link": self.link,
            "created_at": self.created_at.isoformat(),
            "post_id": self.post_id,
            "user_id": self.user_id,
            "username": self.user.username,
            "parent_id": self.parent_id,
        }