-- deploy/add_indexes.sql
-- correr contra la DB para crear los indices que aceleran las queries
-- ejecutar con: psql "postgresql://wtf_admin:wherethefitrds@wtf-db.c748s0cgwdj8.us-east-2.rds.amazonaws.com:5432/wtfdb" -f deploy/add_indexes.sql

-- indices en posts
CREATE INDEX IF NOT EXISTS ix_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS ix_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_posts_category ON posts (category);
CREATE INDEX IF NOT EXISTS ix_posts_status ON posts (status);

-- indices en post_images
CREATE INDEX IF NOT EXISTS ix_post_images_post_id ON post_images (post_id);

-- indices en comments
CREATE INDEX IF NOT EXISTS ix_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS ix_comments_user_id ON comments (user_id);

-- indices en likes
CREATE INDEX IF NOT EXISTS ix_likes_user_id ON likes (user_id);
CREATE INDEX IF NOT EXISTS ix_likes_post_id ON likes (post_id);

-- indices en follows
CREATE INDEX IF NOT EXISTS ix_follows_follower_id ON follows (follower_id);
CREATE INDEX IF NOT EXISTS ix_follows_followed_id ON follows (followed_id);

-- indices en messages
CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS ix_messages_receiver_id ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS ix_messages_created_at ON messages (created_at);

-- indice compuesto para el chat (buscar mensajes entre dos usuarios)
CREATE INDEX IF NOT EXISTS ix_messages_conversation ON messages (sender_id, receiver_id, created_at);
