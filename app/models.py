from app import db, bcrypt

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)
    google_id = db.Column(db.String(255), unique=True, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    email_notifications = db.Column(db.Boolean, nullable=False, default=True)

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "profile_picture": self.profile_picture,
            "created_at": self.created_at.isoformat(),
            "google_id": self.google_id,
            "email_notifications": self.email_notifications,
        }


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    tags = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")
    resolved_location = db.Column(db.String(200), nullable=True)
    resolved_instagram = db.Column(db.String(200), nullable=True)
    resolved_link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref="posts")
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "image_url": self.image_url,
            "images": [img.to_dict() for img in sorted(self.images, key=lambda x: x.order)],
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
            "username": self.user.username,
            "tags": self.tags.split(",") if self.tags else [],
            "resolved_location": self.resolved_location,
            "resolved_instagram": self.resolved_instagram,
            "resolved_link": self.resolved_link,
            "likes": len(self.likes),
            "liked_by": [like.user_id for like in self.likes],
            "latitude": self.latitude,
            "longitude": self.longitude,
        }


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("comments.id"), nullable=True)
    replies = db.relationship("Comment", backref=db.backref("parent", remote_side=[id]))
    post = db.relationship("Post", backref="comments")
    user = db.relationship("User", backref="comments")

    def to_dict(self):
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


class PostImage(db.Model):
    __tablename__ = "post_images"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    post = db.relationship("Post", backref="images")

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "order": self.order,
            "post_id": self.post_id,
        }


class Follow(db.Model):
    __tablename__ = "follows"

    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    follower = db.relationship("User", foreign_keys=[follower_id], backref="following")
    followed = db.relationship("User", foreign_keys=[followed_id], backref="followers")

    def to_dict(self):
        return {
            "id": self.id,
            "follower_id": self.follower_id,
            "followed_id": self.followed_id,
            "created_at": self.created_at.isoformat(),
        }


class Like(db.Model):
    __tablename__ = "likes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship("User", backref="likes")
    post = db.relationship("Post", backref="likes")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "text": self.text,
            "created_at": self.created_at.isoformat(),
            "sender_username": self.sender.username,
        }