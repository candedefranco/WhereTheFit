from datetime import datetime

from flask_mail import Message
from app import mail, db


def send_notification_email(recipient, subject, html_body):
    # esta funcion es un helper generico para mandar cualquier mail desde los servicios
    try:
        # armo el objeto mensaje basico con los datos que me pasaron
        msg = Message(
            subject=subject,
            recipients=[recipient]
        )
        msg.html = html_body

        # despacho el correo usando la config de flask-mail
        mail.send(msg)
        return True

    except Exception as e:
        # si falla la conexion con gmail, atrapo el error aca para que no rompa el flujo
        print(f"error al despachar el mail a {recipient}: {str(e)}")

    # despacho seguro:asegura la liberación inmediata de los recursos de la sesión
    finally:
        db.session.remove()

    return False