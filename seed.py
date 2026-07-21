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
        "title": "Corset hecho con corbatas, NECESITO saber de dónde es",
        "description": "Vi este corset armado con corbatas escocesas marrones sobre una camisa blanca y me voló la cabeza. Es como un top estructurado hecho con telas de corbata. Alguien sabe si hay algún diseñador en Argentina que haga algo así?",
        "category": "Top",
        "tags": "corset,corbata,handmade,escoces,vintage",
        "latitude": -34.5875,
        "longitude": -58.4016,
        "images": [f"{S3_BASE}/corset_corbatas.jpg"],
    },
    {
        "title": "Corbata bordó rayada usada como cinturón",
        "description": "Quiero una corbata de seda rayada bordó con rayas blancas y azul marino para usar como cinturón con jeans claros. No cualquier corbata, busco esa textura de seda con caída. Alguien vio en ferias americanas de CABA?",
        "category": "Accesorios",
        "tags": "corbata,cinturon,seda,bordo,streetwear",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": [f"{S3_BASE}/corbata_cinturon.jpg"],
    },
    {
        "title": "Este jean con encaje y apliques, DE DÓNDE ES",
        "description": "Estoy obsesionada con este jean wide leg que tiene encaje bordado, cruces, perlas y apliques. Todo el outfit es increíble: la corbata, la camisa manga corta, el cinturón bordó. Necesito saber la marca del jean principalmente.",
        "category": "Pantalones",
        "tags": "jean,encaje,perlas,Y2K,coquette",
        "latitude": -34.5795,
        "longitude": -58.4258,
        "images": [f"{S3_BASE}/jean_encaje_y2k.jpg"],
    },
    {
        "title": "Campera de cuero marrón con grabado en la espalda",
        "description": "Vi esta campera de cuero marrón oscuro con un lettering/grabado enorme en la espalda en un shopping. Es oversize y tiene un estilo retro increíble. No llegué a ver la marca. Alguien la reconoce?",
        "category": "Abrigos",
        "tags": "campera,cuero,marrón,oversize,lettering",
        "latitude": -34.6118,
        "longitude": -58.3823,
        "images": [f"{S3_BASE}/campera_cuero_lettering.jpg"],
    },
    {
        "title": "Cinturón rosa con tachas + look completo streetwear",
        "description": "Busco este cinturón rosa/bordó con tachas y hebilla western grande. También me interesa la boina negra y los collares de cruces tipo rosario. El look entero es con musculosa blanca y jean oscuro. Alguien sabe de dónde es el cinturón?",
        "category": "Accesorios",
        "tags": "cinturon,tachas,western,boina,streetwear",
        "latitude": -34.5080,
        "longitude": -58.4897,
        "images": [f"{S3_BASE}/streetwear_musculosa_accesorios.jpg"],
    },
    {
        "title": "Jean baggy con broches, pines y cadenas",
        "description": "Busco un jean baggy decorado con pines, broches de perla, cadenas y safety pins por todos lados. También el cinturón de cadena dorada. Alguien customiza jeans así en Buenos Aires? O saben de qué marca es?",
        "category": "Pantalones",
        "tags": "jean,baggy,pines,broches,customizado",
        "latitude": -34.5917,
        "longitude": -58.3967,
        "images": [f"{S3_BASE}/jean_pines_broches.jpg"],
    },
    {
        "title": "Bufanda roja de lana + zapatitos rojos",
        "description": "Necesito esta bufanda roja gruesa con flecos (parece mohair o lana). También los zapatos rojos tipo ballet con punta y la campera denim. El look completo es 10/10. Dónde consigo la bufanda en CABA?",
        "category": "Accesorios",
        "tags": "bufanda,roja,mohair,lana,invierno",
        "latitude": -34.6083,
        "longitude": -58.3712,
        "images": [f"{S3_BASE}/bufanda_roja_outfit.jpg"],
    },
    {
        "title": "Botas de gamuza marrón arrugadas con taco",
        "description": "Busco estas botas de gamuza marrón/camel con efecto arrugado y taco stiletto. Las vi en una foto y me enamoré. Son tipo slouchy. No encuentro nada parecido que no salga una fortuna.",
        "category": "Zapatos",
        "tags": "botas,gamuza,marron,taco,slouchy",
        "latitude": -34.5647,
        "longitude": -58.4537,
        "images": [f"{S3_BASE}/botas_gamuza_marron.jpg"],
    },
    {
        "title": "Trench beige + sweater + camisa rayada, quiero este look",
        "description": "Quiero replicar este look de capas: camisa rayada azul y blanca abajo, sweater beige encima, y trench coat beige arriba. Con jean claro y collar de cadena. Dónde consigo un buen trench así en Buenos Aires?",
        "category": "Abrigos",
        "tags": "trench,beige,capas,oldmoney,invierno",
        "latitude": -34.5882,
        "longitude": -58.3964,
        "images": [f"{S3_BASE}/trench_beige_camisa.jpg"],
    },
    {
        "title": "Blazer oversized gris + minifalda + botas cowboy",
        "description": "Me encanta esta combinación: blazer oversize gris largo con musculosa blanca, minifalda de jean y botitas cowboy color suela. El collar dorado chunky también. Alguien tiene referencia del blazer?",
        "category": "Abrigos",
        "tags": "blazer,oversize,gris,cowboy,botas",
        "latitude": -34.6345,
        "longitude": -58.4065,
        "images": [f"{S3_BASE}/blazer_gris_botas_cowboy.jpg"],
    },
    {
        "title": "Campera Adidas vintage azul con rayas blancas",
        "description": "Busco esta campera Adidas vintage azul oscuro con las tres rayas blancas. Es tipo track jacket retro de los 90s/2000s. La quiero original, no réplica. Alguien sabe en qué ferias americanas puedo encontrar?",
        "category": "Abrigos",
        "tags": "adidas,vintage,azul,trackjacket,90s",
        "latitude": -34.5741,
        "longitude": -58.4215,
        "images": [f"{S3_BASE}/campera_adidas_azul.jpg"],
    },
    {
        "title": "Traje gris oversized con cinturón rojo statement",
        "description": "Vi este look y me obsesioné: traje gris oversized (blazer + pantalón) con musculosa blanca y un cinturón ancho rojo con hebilla plateada enorme. Necesito el cinturón. Alguien lo vio en algún local?",
        "category": "Accesorios",
        "tags": "cinturon,rojo,traje,gris,oversized",
        "latitude": -34.6158,
        "longitude": -58.4333,
        "images": [f"{S3_BASE}/traje_gris_cinturon_rojo.jpg"],
    },
    {
        "title": "Collares layered dorados con piedras y choker",
        "description": "Busco este combo de collares: un choker tejido dorado, una cadena snake con dije de piedra oscura, y un collar largo con colgante triangular dorado texturado. Todo junto queda increíble. Dónde consigo accesorios así?",
        "category": "Accesorios",
        "tags": "collares,dorado,choker,piedras,layered",
        "latitude": -34.5998,
        "longitude": -58.3750,
        "images": [f"{S3_BASE}/collares_dorados_layered.jpg"],
    },
    {
        "title": "Look total black: abrigo largo + polera + cartera",
        "description": "Necesito este abrigo largo negro tipo paletó recto, bien estructurado. Lo vi con polera negra abajo, jean negro y botines. La cartera negra de cuero suave también me interesa. Alguna marca argentina que haga abrigos así?",
        "category": "Abrigos",
        "tags": "abrigo,negro,totalblack,minimalist,invierno",
        "latitude": -34.5553,
        "longitude": -58.4617,
        "images": [f"{S3_BASE}/total_black_abrigo.jpg"],
    },
    {
        "title": "Campera cuero negra corta + botas beige punta",
        "description": "Busco esta campera de cuero negra corta tipo biker con botones. La foto la muestra con camisa blanca larga y botas beige de punta con taco. Me interesa la campera principalmente. No es la típica de cierre, tiene botones.",
        "category": "Abrigos",
        "tags": "campera,cuero,negra,biker,botones",
        "latitude": -34.6037,
        "longitude": -58.3816,
        "images": [f"{S3_BASE}/campera_cuero_negra_botas.jpg"],
    },
    {
        "title": "Chaqueta militar blanca con botones dorados",
        "description": "Estoy buscando esta chaqueta blanca estilo militar/napoleónica con bordados dorados y botones metálicos. Es corta, bien entallada. La vi en la calle y no pude preguntar. Alguien la reconoce?",
        "category": "Abrigos",
        "tags": "chaqueta,militar,blanca,dorado,vintage",
        "latitude": -34.5839,
        "longitude": -58.4319,
        "images": [f"{S3_BASE}/chaqueta_militar_blanca.jpg"],
    },
    {
        "title": "Sweater rojo sobre camisa denim + pantalón marrón",
        "description": "Me encanta este look de capas: camisa de jean azul oscuro, sweater rojo atado al cuello, pantalón marrón tipo pana wide leg y cinturón animal print. Busco el sweater rojo principalmente. Lana gruesa, bien saturado.",
        "category": "Abrigos",
        "tags": "sweater,rojo,denim,capas,invierno",
        "latitude": -34.6068,
        "longitude": -58.4077,
        "images": [f"{S3_BASE}/capas_sweater_rojo_denim.jpg"],
    },
    {
        "title": "Blazer marrón chocolate oversized + polera beige",
        "description": "Quiero este blazer marrón chocolate bien oversized que se usa con polera beige abajo y jean wide leg celeste. Tiene las mangas arremangadas mostrando la polera. Talle S que quede enorme. Dónde lo consigo?",
        "category": "Abrigos",
        "tags": "blazer,marron,oversize,polera,oldmoney",
        "latitude": -34.5726,
        "longitude": -58.4378,
        "images": [f"{S3_BASE}/blazer_marron_polera.jpg"],
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
