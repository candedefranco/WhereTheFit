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

# posts realistas de moda argentina - fotos reales subidas a S3
POSTS = [
    {
        "title": "Corset hecho con corbatas, NECESITO saber de dónde es",
        "description": "Vi este corset armado con corbatas escocesas marrones en Pinterest y me voló la cabeza. Parece hecho a mano. Alguien sabe si hay algún diseñador en Argentina que haga algo así?",
        "category": "Top",
        "tags": "corset,corbata,handmade,escoces,vintage",
        "latitude": -34.5875,
        "longitude": -58.4016,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_1.jpg"],
    },
    {
        "title": "Corbata usada como cinturón en jean, dónde consigo?",
        "description": "Quiero una corbata rayada bordó para usar como cinturón con mis jeans. No una corbata cualquiera, busco esa textura de seda con las rayas blancas y azules. Alguien vio en ferias americanas?",
        "category": "Accesorios",
        "tags": "corbata,cinturon,streetwear,vintage,seda",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_2.jpg"],
    },
    {
        "title": "Este jean con encaje y apliques, ALGUIEN SABE DE DÓNDE ES",
        "description": "Estoy obsesionada con este jean que tiene encaje, cruces y apliques de perlas. Es wide leg y tiene como un estilo Y2K pero más recargado. También la corbata y el cinturón. Todo el outfit es increíble.",
        "category": "Pantalones",
        "tags": "jean,encaje,perlas,Y2K,coquette",
        "latitude": -34.5795,
        "longitude": -58.4258,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_3.jpg"],
    },
    {
        "title": "Campera de cuero con lettering en la espalda",
        "description": "Vi esta campera en un shopping y no llegué a ver la marca. Es de cuero marrón oscuro con un grabado/lettering enorme en la espalda. Oversize. Si alguien la vio en algún lado avise POR FAVOR.",
        "category": "Abrigos",
        "tags": "campera,cuero,marrón,oversize,lettering",
        "latitude": -34.6118,
        "longitude": -58.3823,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_4.jpg"],
    },
    {
        "title": "Cinturón rosa con tachas + collar de cruces",
        "description": "Busco este cinturón rosa/bordó con tachas y hebilla western. También el collar de cruces plateado tipo rosario largo. El look completo es increíble, la boina negra también la quiero.",
        "category": "Accesorios",
        "tags": "cinturon,tachas,western,cruces,streetwear",
        "latitude": -34.5080,
        "longitude": -58.4897,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_5.jpg"],
    },
    {
        "title": "Jean baggy con broches y pines decorativos",
        "description": "Estoy buscando un jean baggy al que le pueda poner pines, broches y cadenas así. O si alguien ya vende algo así customizado en Argentina. El cinturón de cadena dorada también lo necesito.",
        "category": "Pantalones",
        "tags": "jean,baggy,pines,broches,customizado",
        "latitude": -34.5917,
        "longitude": -58.3967,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_6.jpg"],
    },
    {
        "title": "Bufanda roja de mohair + zapatos rojos",
        "description": "Necesito esta bufanda roja que parece de mohair o lana gruesa con flecos. También los zapatos rojos tipo ballet flat pero con punta. Alguien sabe dónde conseguir bufandas así en CABA?",
        "category": "Accesorios",
        "tags": "bufanda,roja,mohair,invierno,streetwear",
        "latitude": -34.6083,
        "longitude": -58.3712,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_7.jpg"],
    },
    {
        "title": "Botas de gamuza marrón con taco",
        "description": "Busco unas botas así, de gamuza marrón/camel, arrugadas, con taco fino. Las vi en una foto y me enamoré. No encuentro nada parecido que no salga un ojo de la cara.",
        "category": "Zapatos",
        "tags": "botas,gamuza,marrón,taco,invierno",
        "latitude": -34.5647,
        "longitude": -58.4537,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_8.jpg"],
    },
    {
        "title": "Trench beige + sweater + camisa rayada, el look completo",
        "description": "Quiero replicar este look de capas: camisa rayada azul y blanca + sweater beige + trench coat encima. Dónde consigo un buen trench en Buenos Aires que no sea de Zara? Algo más premium.",
        "category": "Abrigos",
        "tags": "trench,beige,capas,oldmoney,invierno",
        "latitude": -34.5882,
        "longitude": -58.3964,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_9.jpg"],
    },
    {
        "title": "Blazer oversized gris + botas cowboy marrones",
        "description": "Me encanta esta combinación de blazer oversize gris con minifalda de jean y botitas cowboy color suela. El collar dorado chunky también. Alguien tiene una referencia del blazer?",
        "category": "Abrigos",
        "tags": "blazer,oversize,gris,cowboy,botas",
        "latitude": -34.6345,
        "longitude": -58.4065,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_10.jpg"],
    },
    {
        "title": "Busco esta musculosa blanca básica de buena calidad",
        "description": "Parece simple pero no encuentro una musculosa blanca con esta caída, bien pegada pero no transparente. Algodón grueso. La de la foto tiene el corte perfecto. Alguna marca argentina?",
        "category": "Top",
        "tags": "musculosa,blanca,basica,algodon,minimalist",
        "latitude": -34.5741,
        "longitude": -58.4215,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_11.jpg"],
    },
    {
        "title": "Campera denim oversized azul oscuro",
        "description": "Busco una campera de jean azul oscuro bien oversized como la de la foto. Que no sea celeste ni clara, sino azul profundo. Sin roturas. Alguien vio en tiendas de acá?",
        "category": "Abrigos",
        "tags": "campera,denim,azul,oversize,streetwear",
        "latitude": -34.6158,
        "longitude": -58.4333,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_7.jpg"],
    },
    {
        "title": "Jean wide leg celeste lavado",
        "description": "Necesito un jean wide leg bien clarito, lavado, tipo el de la foto. Tiro bajo o medio. Que sea de tela gruesa y no se deforme. Talle 38.",
        "category": "Pantalones",
        "tags": "jean,wideleg,celeste,lavado,vintage",
        "latitude": -34.5998,
        "longitude": -58.3750,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_2.jpg"],
    },
    {
        "title": "Collar cadena dorada gruesa tipo toggle",
        "description": "Busco un collar de cadena gruesa dorada con cierre tipo toggle (esa barrita que pasa por el aro). Lo vi en varias fotos de street style y me encanta. Que no se ponga verde.",
        "category": "Accesorios",
        "tags": "collar,cadena,dorado,toggle,minimalist",
        "latitude": -34.5553,
        "longitude": -58.4617,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_10.jpg"],
    },
    {
        "title": "Minifalda de jean gris/lavado",
        "description": "Quiero una minifalda de jean gris tipo la de la foto, corte recto, no acampanada. Talle S. Con cinturón western de cuero. Zona Palermo o envíos.",
        "category": "Faldas",
        "tags": "minifalda,jean,gris,western,casual",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_10.jpg"],
    },
    {
        "title": "Sweater beige cuello redondo de lana",
        "description": "Busco un sweater beige/arena como el de la foto, cuello redondo, sin estampas, textura de lana suave. Para usar sobre camisa. Que no pique!",
        "category": "Abrigos",
        "tags": "sweater,beige,lana,oldmoney,invierno",
        "latitude": -34.5839,
        "longitude": -58.4319,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_9.jpg"],
    },
    {
        "title": "Cinturón de cuero labrado estilo western",
        "description": "Estoy buscando un cinturón de cuero labrado como el de la foto, con dibujos tipo western/texano. Color marrón natural. Alguien conoce algún talabartero o marca que los haga?",
        "category": "Accesorios",
        "tags": "cinturon,cuero,labrado,western,texano",
        "latitude": -34.6068,
        "longitude": -58.4077,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_10.jpg"],
    },
    {
        "title": "Camisa blanca manga corta con corte cropped",
        "description": "Busco una camisa blanca de manga corta con corte cropped tipo la de la foto. Que tenga botones y cuello, pero que termine arriba de la cintura. Para combinar con jeans tiro bajo.",
        "category": "Remeras",
        "tags": "camisa,blanca,cropped,clasica,coquette",
        "latitude": -34.5726,
        "longitude": -58.4378,
        "images": ["https://wherethefit.s3.us-east-2.amazonaws.com/seed/post_3.jpg"],
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
            db.session.flush()

            # agrego las imagenes del post
            for j, img_url in enumerate(p_data.get("images", [])):
                image = PostImage(url=img_url, order=j, post_id=post.id)
                db.session.add(image)

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
