import boto3
import os
import uuid
from werkzeug.utils import secure_filename

# creo el cliente de S3 con las credenciales del .env
s3_client = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

def upload_image(file):
    # genero un nombre unico para evitar colisiones
    filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"

    # subo el archivo a S3 con acceso publico
    s3_client.upload_fileobj(
        file,
        BUCKET_NAME,
        filename,
        ExtraArgs={"ContentType": file.content_type},
    )

    # devuelvo la URL publica de la imagen
    return f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{filename}"