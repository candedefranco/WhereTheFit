"""
seed.py - Script para poblar la base de datos con datos realistas para la demo.
Correr con: source venv/bin/activate && python seed.py
"""
from app import create_app, db, bcrypt
from app.models import User, Post, PostImage, Comment, Like, Follow
from datetime import datetime, timedelta
import random

app = create_app()

# datos de usuarios ficticios argentinos
USERS = [
    {"username": "sofiamendez", "email": "sofia.mendez@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=1"},
    {"username": "juancruz_", "email": "juancruz.moda@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=3"},
    {"username": "camilafit", "email": "camila.fit@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=5"},
    {"username": "maborges", "email": "ma.borges@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=9"},
    {"username": "tomasruiz", "email": "tomas.ruiz@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=11"},
    {"username": "valentinagz", "email": "vale.gonzalez@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=16"},
    {"username": "nicoortega", "email": "nico.ortega@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=12"},
    {"username": "luudiaz", "email": "lu.diaz.moda@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=20"},
    {"username": "mikiromero", "email": "miki.romero@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=33"},
    {"username": "aguslopez", "email": "agus.lopez@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=25"},
    {"username": "rocioherrera", "email": "rocio.herrera@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=44"},
    {"username": "facunavarro", "email": "facu.navarro@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=52"},
    {"username": "delfimoreno", "email": "delfi.moreno@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=47"},
    {"username": "mateosilva", "email": "mateo.silva@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=53"},
    {"username": "florcastro", "email": "flor.castro@gmail.com", "profile_picture": "https://i.pravatar.cc/150?img=45"},
]

# posts realistas de moda argentina
POSTS = [
    {
        "title": "Busco esta campera de cuero marrón",
        "description": "La vi en una story de Instagram pero no etiquetaron la marca. Es marrón oscuro, tipo oversize, con cierre dorado. Si alguien sabe dónde conseguirla en CABA me salvan la vida.",
        "category": "Abrigos",
        "tags": "cuero,marrón,oversize,campera,vintage",
        "latitude": -34.5875,
        "longitude": -58.4016,
    },
    {
        "title": "¿Alguien sabe de dónde es este jean baggy?",
        "description": "Es un jean baggy celeste clarito con roturas en las rodillas. Lo vi en TikTok pero el video no decía la marca. Busco en talle M.",
        "category": "Pantalones",
        "tags": "jean,baggy,celeste,rotura,streetwear",
        "latitude": -34.6037,
        "longitude": -58.3816,
    },
    {
        "title": "Top tejido a crochet rosa",
        "description": "Busco un top de crochet rosa pastel, tipo halter. Vi uno parecido en Palermo pero no me acuerdo el local. Ideal para el verano.",
        "category": "Top",
        "tags": "crochet,rosa,halter,verano,handmade",
        "latitude": -34.5795,
        "longitude": -58.4258,
    },
    {
        "title": "Zapatillas blancas con plataforma",
        "description": "Son blancas, plataforma de unos 4cm, suela gruesa tipo chunky. Las vi en el subte y me enamoré. No son Nike ni Adidas, parecen de marca local.",
        "category": "Zapatos",
        "tags": "zapatillas,blancas,plataforma,chunky,streetwear",
        "latitude": -34.6118,
        "longitude": -58.3823,
    },
    {
        "title": "Vestido largo floreado para fiesta",
        "description": "Necesito un vestido largo con estampado de flores tipo acuarela para un casamiento en diciembre. Presupuesto hasta $80k. Zona norte preferentemente.",
        "category": "Vestidos",
        "tags": "vestido,floreado,largo,fiesta,elegante",
        "latitude": -34.5080,
        "longitude": -58.4897,
    },
    {
        "title": "Bolso de cuero tipo saddle",
        "description": "Estoy buscando un bolso estilo saddle bag en cuero natural, sin marca específica. Vi varios en ferias americanas pero nunca encuentro en buen estado.",
        "category": "Bolsos",
        "tags": "bolso,cuero,saddle,vintage,feria",
        "latitude": -34.5917,
        "longitude": -58.3967,
    },
    {
        "title": "Remera negra con estampa de banda",
        "description": "Busco remeras oversized negras con estampas de bandas de rock (tipo Nirvana, Led Zeppelin). Las truchas se rompen al toque, quiero algo de buena calidad.",
        "category": "Remeras",
        "tags": "remera,negra,oversize,rock,banda",
        "latitude": -34.6083,
        "longitude": -58.3712,
    },
    {
        "title": "Falda plisada verde esmeralda",
        "description": "Vi una falda plisada verde esmeralda midi en una revista y no puedo encontrarla. Es satinada, con brillo. Alguna referencia?",
        "category": "Faldas",
        "tags": "falda,plisada,verde,midi,satinada",
        "latitude": -34.5647,
        "longitude": -58.4537,
    },
    {
        "title": "Anteojos de sol cat eye grandes",
        "description": "Busco unos lentes de sol estilo cat eye exagerados, tipo los de Bella Hadid. Color negro o carey. No quiero pagar fortuna pero que sean lindos.",
        "category": "Accesorios",
        "tags": "anteojos,cateye,negro,carey,aesthetic",
        "latitude": -34.5882,
        "longitude": -58.3964,
    },
    {
        "title": "Pantalón cargo verde militar",
        "description": "Necesito un pantalón cargo verde militar, tiro alto, con bolsillos laterales. Que sea de tela gruesa, no esos finitos que se transparentan.",
        "category": "Pantalones",
        "tags": "cargo,verde,militar,streetwear,tiroalto",
        "latitude": -34.6345,
        "longitude": -58.4065,
    },
    {
        "title": "Blazer oversized beige",
        "description": "Quiero un blazer oversized color beige/arena, sin forro, liviano para entretiempo. Estilo old money. Talle S que quede grande.",
        "category": "Abrigos",
        "tags": "blazer,beige,oversize,oldmoney,entretiempo",
        "latitude": -34.5741,
        "longitude": -58.4215,
    },
    {
        "title": "Set deportivo lila/lavanda",
        "description": "Busco un conjunto deportivo (calza + top) color lila o lavanda para entrenar. Que sea de buena calidad y no se haga pelotitas.",
        "category": "Deportivo",
        "tags": "deportivo,lila,lavanda,calza,gym",
        "latitude": -34.6158,
        "longitude": -58.4333,
    },
    {
        "title": "Corset negro con ballenas",
        "description": "Estoy buscando un corset negro con ballenas reales (no decorativo) que se pueda usar como top. Lo quiero para una fiesta pero que se pueda reusar.",
        "category": "Top",
        "tags": "corset,negro,ballenas,fiesta,coquette",
        "latitude": -34.5998,
        "longitude": -58.3750,
    },
    {
        "title": "Botas texanas color camel",
        "description": "Necesito botas texanas/cowboy color camel o marrón claro. Taco no muy alto. Para usar con vestidos y polleras en verano.",
        "category": "Zapatos",
        "tags": "botas,texanas,cowboy,camel,verano",
        "latitude": -34.5553,
        "longitude": -58.4617,
    },
    {
        "title": "Aros argolla dorados grandes",
        "description": "Busco aros argolla dorados grandes (tipo 5cm de diámetro) que no se pongan verdes. Enchapados en oro o acero quirúrgico.",
        "category": "Accesorios",
        "tags": "aros,argolla,dorado,acero,minimalist",
        "latitude": -34.6037,
        "longitude": -58.3816,
    },
    {
        "title": "Campera puffer rosa chicle",
        "description": "Vi una campera puffer rosa chicle/fucsia que me encantó. Es corta, tipo crop. La vi en Palermo Soho pero no me acuerdo el local exacto.",
        "category": "Abrigos",
        "tags": "puffer,rosa,fucsia,crop,invierno",
        "latitude": -34.5839,
        "longitude": -58.4319,
    },
    {
        "title": "Buzo hoodie tie-dye",
        "description": "Busco un buzo con capucha tie-dye en tonos pastel (rosa, celeste, lila). Oversize. Vi varios en Once pero la calidad era mala.",
        "category": "Remeras",
        "tags": "buzo,hoodie,tiedye,pastel,oversize",
        "latitude": -34.6068,
        "longitude": -58.4077,
    },
    {
        "title": "Pollera de jean con botones",
        "description": "Una pollera de jean A-line con botones al frente, largo hasta la rodilla. Estilo vintage de los 90s. Talle 38/40.",
        "category": "Faldas",
        "tags": "pollera,jean,botones,vintage,90s",
        "latitude": -34.5726,
        "longitude": -58.4378,
    },
]

# comentarios realistas
COMMENTS = [
    "Creo que lo vi en Zara del Abasto! Fijate en la sección de nuevos ingresos.",
    "En Palermo hay un local que se llama 'La Flor' que tiene cosas muy parecidas.",
    "Probá en @tienda_vintage_ba en Instagram, tiene cosas así.",
    "Lo vi en Rapsodia de Unicenter la semana pasada!",
    "Fijate en Mercado Libre, busca 'prenda + el estilo' y filtrá por envío full.",
    "Esa marca es Complot creo, fijate en su outlet online.",
    "En la feria de Dorrego hay un puesto que vende exactamente eso.",
    "Probá en Avellaneda, sobre la calle que tiene todos los mayoristas.",
    "En Dafiti hay algo muy parecido, buscá por la categoría.",
    "Lo vi en el Instagram de @buenosaires.fashion, mirá sus stories de hoy.",
    "En H&M del Dot tenían algo idéntico la última vez que fui.",
    "Fijate en Shein, tardan pero el precio es imbatible para eso.",
    "El local se llama 'Green Store' en Villa Crespo, Acuña de Figueroa al 800.",
    "Probá en Kosiuko, siempre tienen ese estilo.",
    "Mi amiga compró algo igual en @showroom_ba, mandale DM.",
]

# posts resueltos con datos de resolución
RESOLVED_DATA = [
    {"location": "Zara Palermo, Santa Fe 3253", "instagram": "@zara", "link": "https://www.zara.com/ar"},
    {"location": "Rapsodia Unicenter", "instagram": "@rapsodia", "link": "https://www.rapsodia.com"},
    {"location": "Feria de San Telmo, puesto 42", "instagram": None, "link": None},
    {"location": None, "instagram": "@vintage.ba.ok", "link": "https://www.instagram.com/vintage.ba.ok"},
]


def seed():
    with app.app_context():
        print("🌱 Empezando seed...")

        # creo usuarios
        users = []
        for u_data in USERS:
            existing = User.query.filter_by(email=u_data["email"]).first()
            if existing:
                users.append(existing)
                continue
            user = User(
                username=u_data["username"],
                email=u_data["email"],
                profile_picture=u_data["profile_picture"],
                email_verified=True,
            )
            user.set_password("test1234")
            db.session.add(user)
            users.append(user)

        db.session.flush()
        print(f"  ✓ {len(users)} usuarios")

        # creo posts (distribuidos entre usuarios, con fechas variadas)
        posts = []
        for i, p_data in enumerate(POSTS):
            author = users[i % len(users)]
            days_ago = random.randint(0, 14)
            hours_ago = random.randint(0, 23)

            post = Post(
                title=p_data["title"],
                description=p_data["description"],
                category=p_data["category"],
                tags=p_data["tags"],
                user_id=author.id,
                latitude=p_data["latitude"],
                longitude=p_data["longitude"],
                created_at=datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago),
            )
            db.session.add(post)
            posts.append(post)

        db.session.flush()
        print(f"  ✓ {len(posts)} posts")

        # marco algunos posts como resueltos
        for i in range(4):
            posts[i].status = "resolved"
            posts[i].resolved_location = RESOLVED_DATA[i]["location"]
            posts[i].resolved_instagram = RESOLVED_DATA[i]["instagram"]
            posts[i].resolved_link = RESOLVED_DATA[i]["link"]

        # creo comentarios (2-4 por post)
        total_comments = 0
        for post in posts:
            num_comments = random.randint(2, 4)
            commenters = random.sample([u for u in users if u.id != post.user_id], min(num_comments, len(users) - 1))
            for commenter in commenters:
                comment = Comment(
                    text=random.choice(COMMENTS),
                    post_id=post.id,
                    user_id=commenter.id,
                    created_at=post.created_at + timedelta(hours=random.randint(1, 48)),
                )
                db.session.add(comment)
                total_comments += 1

        print(f"  ✓ {total_comments} comentarios")

        # creo likes (cada usuario likea 5-10 posts random)
        total_likes = 0
        for user in users:
            posts_to_like = random.sample(posts, min(random.randint(5, 10), len(posts)))
            for post in posts_to_like:
                if post.user_id == user.id:
                    continue
                existing = Like.query.filter_by(user_id=user.id, post_id=post.id).first()
                if not existing:
                    like = Like(
                        user_id=user.id,
                        post_id=post.id,
                        created_at=post.created_at + timedelta(hours=random.randint(1, 72)),
                    )
                    db.session.add(like)
                    total_likes += 1

        print(f"  ✓ {total_likes} likes")

        # creo follows (cada usuario sigue a 3-7 personas random, creando algunos mutuals)
        total_follows = 0
        for user in users:
            to_follow = random.sample([u for u in users if u.id != user.id], min(random.randint(3, 7), len(users) - 1))
            for target in to_follow:
                existing = Follow.query.filter_by(follower_id=user.id, followed_id=target.id).first()
                if not existing:
                    follow = Follow(
                        follower_id=user.id,
                        followed_id=target.id,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    )
                    db.session.add(follow)
                    total_follows += 1

        print(f"  ✓ {total_follows} follows")

        db.session.commit()
        print("\n🎉 Seed completado!")
        print(f"   Password de todos los usuarios: test1234")
        print(f"   Algunos mutuals se crearon aleatoriamente (para probar el chat)")


if __name__ == "__main__":
    seed()
