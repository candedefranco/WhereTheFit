import os
from google import genai
from google.genai import types

# creo el cliente con la API key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def suggest_tags(image_bytes: bytes, mime_type: str, description: str) -> list[str]:
    # armo el prompt para que devuelva tags relevantes para moda argentina
    prompt = f"""
    Analizá esta imagen de ropa y la siguiente descripción: "{description}".

    Generá entre 8 y 10 tags relevantes para una red social de moda argentina.
    Los tags deben describir: tipo de prenda, color, estilo, o características visuales.

    Respondé ÚNICAMENTE con los tags separados por comas, sin hashtags, sin explicaciones.
    Ejemplo: campera, cuero, negro, oversize, vintage
    """

    # mando la imagen y el prompt a Gemini
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ]
    )

    # parseo la respuesta y devuelvo una lista de tags limpios
    raw = response.text.strip()
    tags = [tag.strip().lower() for tag in raw.split(",") if tag.strip()]
    return tags[:10]