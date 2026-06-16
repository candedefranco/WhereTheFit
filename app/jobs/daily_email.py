import os
from datetime import datetime, timedelta

from flask import render_template

from app import db
# importo los modelos de la base de datos para revisar la actividad
from app.models import User, Post, Comment, Like, Follow
# importo el servicio que creamos recien en la carpeta services
from app.services.email import send_notification_email


def enviar_resumen_diario():
    # esta funcion procesa los datos y usa el servicio de mail de fondo

    # defino el rango de las ultimas 24 horas para filtrar las novedades
    hace_24_horas = datetime.utcnow() - timedelta(hours=24)

    print(f"[{datetime.now()}] arrancando el cronjob de mails diarios...")

    try:
        # traigo todos los usuarios para armar el reporte de cada uno
        usuarios = User.query.all()

        for usuario in usuarios:

            # likes: cuento los likes nuevos en las publicaciones de este usuario
            likes_nuevos = db.session.query(Like).join(Post).filter(
                Post.user_id == usuario.id,
                Like.created_at >= hace_24_horas
            ).count()

            # comentarios: cuento los comentarios que le dejaron en sus posts
            comentarios_nuevos = db.session.query(Comment).join(Post).filter(
                Post.user_id == usuario.id,
                Comment.created_at >= hace_24_horas
            ).count()

            # follows: cuento los nuevos seguidores que gano el usuario
            follows_nuevos = Follow.query.filter(
                Follow.followed_id == usuario.id,
                Follow.created_at >= hace_24_horas
            ).count()

            # posts resueltos: busco posts que likeo y cambiaron a resuelto hace poco
            posts_resueltos = db.session.query(Post).join(Like).filter(
                Like.user_id == usuario.id,
                Post.status == "resolved",
                Like.created_at >= hace_24_horas
            ).count()

            # si el usuario desactivó las notificaciones, lo salteamos
            if not usuario.email_notifications:
                continue

            # si el usuario tuvo algun movimiento, le arma el correo personalizado
            if likes_nuevos > 0 or comentarios_nuevos > 0 or follows_nuevos > 0 or posts_resueltos > 0:

                asunto = "Resumen diario de WhereTheFit"
                '''
                body_text = f"¡Hola {usuario.username}!\n\nEsto es lo que pasó en tu comunidad de WhereTheFit en las últimas 24 horas:\n\n"

                if likes_nuevos > 0:
                    body_text += f"❤️ Recibiste {likes_nuevos} likes nuevos en tus publicaciones.\n"
                if comentarios_nuevos > 0:
                    body_text += f"💬 Te dejaron {comentarios_nuevos} comentarios nuevos.\n"
                if follows_nuevos > 0:
                    body_text += f"👤 ¡Ganaste {follows_nuevos} nuevos seguidores!\n"
                if posts_resueltos > 0:
                    body_text += f"✅ {posts_resueltos} publicación(es) que te gustaron se marcaron como RESUELTAS.\n"

                body_text += "\n¡Nos vemos en la app!\nEl equipo de WhereTheFit."

                # llamo al servicio de mail pasandole los datos limpios
                exito = send_notification_email(usuario.email, asunto, body_text)
                if exito:
                    print(f"mail enviado piola a {usuario.email}")
'''

                html_content = render_template(
                    "daily_email_template.html",
                    username=usuario.username,
                    likes_nuevos=likes_nuevos,
                    comentarios_nuevos=comentarios_nuevos,
                    follows_nuevos=follows_nuevos,
                    posts_resueltos=posts_resueltos,
                    frontend_url = os.getenv("FRONTEND_URL")
                )

                exito = send_notification_email(usuario.email, asunto, html_content)
                if exito:
                    print(f"mail HTML enviado piola a {usuario.email}")

    except Exception as e:
        # si pincha el bucle, muestro el error en consola para revisar
        print(f"error en el proceso del cronjob: {str(e)}")

def init_scheduler(app):
    # importa el scheduler aca adentro
    from apscheduler.schedulers.background import BackgroundScheduler

    scheduler = BackgroundScheduler()

    # la funcion auxiliar queda bien guardada en su propio modulo
    def ejecutar_con_contexto():
        with app.app_context():
            enviar_resumen_diario()

    # configura el intervalo
    scheduler.add_job(
        func=ejecutar_con_contexto,
        trigger="interval",
        minutes=10,
        id="job_resumen_diario",
        replace_existing=True
    )
    scheduler.start()