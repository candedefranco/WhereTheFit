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
S3_BASE = "https://wherethefit.s3.us-east-2.amazonaws.com/seed"

POSTS = [
    {
        "title": "Corset hecho con corbatas, de dónde es??",
        "description": "Vi este corset tipo top armado con telas de corbata escocesas. Parece cosido a mano. Alguien conoce a algún diseñador o marca que haga esto en Argentina? Lo necesito.",
        "category": "Top",
        "tags": "corset,corbata,handmade,escoces,vintage",
        "latitude": -34.5875,
        "longitude": -58.4016,
        "images": [f"{S3_BASE}/top_corbatas.jpeg"],
    },
    {
        "title": "Dónde consigo esta corbata bordó rayada?",
        "description": "Busco una corbata de seda bordó con rayas diagonales blancas y azul marino. La quiero para usar como cinturón. Necesito que sea de seda real, no poliéster. Alguna feria americana que tenga?",
        "category": "Accesorios",
        "tags": "corbata,seda,bordo,rayas,vintage",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": [f"{S3_BASE}/corbata.jpeg"],
    },
    {
        "title": "Alguien sabe de qué marca es este jean con encaje?",
        "description": "Necesito saber de dónde es este jean wide leg que tiene bordados de encaje blanco y apliques de perlas. Es lo más increíble que vi. Alguien lo reconoce?",
        "category": "Pantalones",
        "tags": "jean,encaje,perlas,Y2K,wideleg",
        "latitude": -34.5795,
        "longitude": -58.4258,
        "images": [f"{S3_BASE}/boina_y2k.jpeg"],
    },
    {
        "title": "Busco esta campera de cuero con grabado en la espalda",
        "description": "Es una campera de cuero marrón oscuro oversize que tiene un grabado/lettering enorme en toda la espalda. La vi en el subte y no llegué a preguntar. Alguien la reconoce?",
        "category": "Abrigos",
        "tags": "campera,cuero,marrón,oversize,lettering",
        "latitude": -34.6118,
        "longitude": -58.3823,
        "images": [f"{S3_BASE}/campera_marron_cuero.jpeg"],
    },
    {
        "title": "De dónde es este cinturón rosa con tachas?",
        "description": "Busco este cinturón ancho rosa/bordó con tachas plateadas y hebilla western grande. Lo vi en una foto y no puedo encontrarlo en ningún lado. Zona CABA.",
        "category": "Accesorios",
        "tags": "cinturon,tachas,rosa,western,hebilla",
        "latitude": -34.5080,
        "longitude": -58.4897,
        "images": [f"{S3_BASE}/cinturon_brillos.jpeg"],
    },
    {
        "title": "De dónde es este jean con pines y broches?",
        "description": "Busco este jean baggy que tiene safety pins, broches de perla y cadenas por todos lados. También tiene un cinturón de cadena dorada. Alguien sabe la marca o dónde lo venden?",
        "category": "Pantalones",
        "tags": "jean,baggy,pines,broches,cadenas",
        "latitude": -34.5917,
        "longitude": -58.3967,
        "images": [f"{S3_BASE}/pantalon_pins.jpeg"],
    },
    {
        "title": "Dónde consigo esta bufanda roja con flecos?",
        "description": "Busco una bufanda roja bien gruesa con flecos largos, parece de mohair o lana. No la encuentro en ningún lado y la necesito para este invierno. CABA o envíos.",
        "category": "Accesorios",
        "tags": "bufanda,roja,mohair,lana,flecos",
        "latitude": -34.6083,
        "longitude": -58.3712,
        "images": [f"{S3_BASE}/bufanda_roja.jpg"],
    },
    {
        "title": "Busco estas botas slouchy de gamuza marrón",
        "description": "Necesito unas botas de gamuza marrón/camel con ese efecto arrugado slouchy y taco fino. No encuentro nada parecido que no cueste una locura. Alguna referencia?",
        "category": "Zapatos",
        "tags": "botas,gamuza,marron,slouchy,taco",
        "latitude": -34.5647,
        "longitude": -58.4537,
        "images": [f"{S3_BASE}/botas_marron_gamuza.jpg"],
    },
    {
        "title": "Busco un trench beige así, dónde lo consigo?",
        "description": "Quiero un trench coat beige con botones oscuros y cuello así, bien clásico pero que no sea el de Zara. Algo de mejor calidad. Alguna marca argentina o tienda que lo tenga?",
        "category": "Abrigos",
        "tags": "trench,beige,clasico,oldmoney,invierno",
        "latitude": -34.5882,
        "longitude": -58.3964,
        "images": [f"{S3_BASE}/trench_clarito.jpg"],
    },
    {
        "title": "De dónde es este conjunto gris con cinturón rojo?",
        "description": "Me encanta este conjunto gris oversized (blazer + pantalón) con musculosa blanca. El cinturón rojo le da el toque. Alguien sabe de dónde es el conjunto? Busco algo similar.",
        "category": "Abrigos",
        "tags": "conjunto,gris,oversize,blazer,pantalon",
        "latitude": -34.6345,
        "longitude": -58.4065,
        "images": [f"{S3_BASE}/set_gris.jpg"],
    },
    {
        "title": "Campera Adidas vintage azul, dónde la encuentro?",
        "description": "Busco esta campera Adidas vintage azul oscuro con las tres rayas blancas. Track jacket retro tipo 90s/2000s. La quiero original. Alguna feria americana que tenga ropa deportiva vintage?",
        "category": "Abrigos",
        "tags": "adidas,vintage,azul,trackjacket,90s",
        "latitude": -34.5741,
        "longitude": -58.4215,
        "images": [f"{S3_BASE}/campera_azul.jpg"],
    },
    {
        "title": "Necesito este cinturón rojo ancho con hebilla",
        "description": "Busco un cinturón ancho de cuero rojo con hebilla plateada rectangular. Es bien grueso y statement. Dónde lo encuentro en Buenos Aires?",
        "category": "Accesorios",
        "tags": "cinturon,rojo,ancho,hebilla,cuero",
        "latitude": -34.6158,
        "longitude": -58.4333,
        "images": [f"{S3_BASE}/cinturon_rojo.jpg"],
    },
    {
        "title": "Busco este choker dorado tejido, alguien sabe?",
        "description": "Es un choker tipo malla/tejido dorado bien pegado al cuello. Lo vi combinado con otros collares y queda hermoso. No es cadena común, es como una red metálica. Dónde consigo?",
        "category": "Accesorios",
        "tags": "choker,dorado,malla,collar,layered",
        "latitude": -34.5998,
        "longitude": -58.3750,
        "images": [f"{S3_BASE}/collares.jpg"],
    },
    {
        "title": "Busco esta campera de cuero negra con botones",
        "description": "Es una campera de cuero negra corta que tiene botones en vez del cierre típico. Tiene solapa y cuello grande. No es la biker clásica. Alguien la vio en algún local?",
        "category": "Abrigos",
        "tags": "campera,cuero,negra,botones,corta",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": [f"{S3_BASE}/campera_cuero.jpg"],
    },
    {
        "title": "De dónde es este blazer gris estructurado?",
        "description": "Busco un blazer gris medio oversized para usar con musculosa blanca. Tiene un corte bien estructurado, casi masculino. Alguna marca que haga este estilo en Argentina?",
        "category": "Abrigos",
        "tags": "blazer,gris,oversize,estructurado,basico",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": [f"{S3_BASE}/blazer.jpg"],
    },
    {
        "title": "Chaqueta militar blanca con botones dorados, la necesito",
        "description": "Vi a una mina con esta chaqueta blanca estilo militar/napoleónica con bordados y botones dorados. Es corta y entallada. Me muero por encontrarla. Alguien la reconoce?",
        "category": "Abrigos",
        "tags": "chaqueta,militar,blanca,dorado,napoleonica",
        "latitude": -34.5839,
        "longitude": -58.4319,
        "images": [f"{S3_BASE}/campera_blanca_botones.jpg"],
    },
    {
        "title": "Dónde consigo este pantalón marrón wide leg?",
        "description": "Busco un pantalón marrón wide leg tipo gamuza o pana gruesa como el de la foto. Bien holgado y con caída. Talle M. CABA o envíos.",
        "category": "Pantalones",
        "tags": "pantalon,marron,pana,wideleg,invierno",
        "latitude": -34.6068,
        "longitude": -58.4077,
        "images": [f"{S3_BASE}/pantalon_marron.jpg"],
    },
    {
        "title": "Blazer marrón chocolate oversized, dónde lo compro?",
        "description": "Quiero un blazer marrón chocolate bien oversized como el de la foto. Que las mangas queden largas para arremangar. Talle S que quede grande. Alguna tienda en CABA?",
        "category": "Abrigos",
        "tags": "blazer,marron,chocolate,oversize,oldmoney",
        "latitude": -34.5726,
        "longitude": -58.4378,
        "images": [f"{S3_BASE}/polera_beige.jpg"],
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
