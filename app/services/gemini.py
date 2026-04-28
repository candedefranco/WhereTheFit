import os
import google.generativeai as genai

# configuro la API key de Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def suggest_tags(image_bytes: bytes, mime_type: str, description: str) -> list[str]:
    # uso el modelo gemini-1.5-flash que soporta imagenes
    model = genai.GenerativeModel("gemini-1.5-flash")

    # armo el prompt para que devuelva tags relevantes para moda argentina
    prompt = f"""
    Analizá esta imagen de ropa y la siguiente descripción: "{description}".

    Generá entre 8 y 10 tags relevantes para una red social de moda argentina.
    Los tags deben describir: tipo de prenda, color, estilo, o características visuales.

    Respondé ÚNICAMENTE con los tags separados por comas, sin hashtags, sin explicaciones.
    Ejemplo: campera, cuero, negro, oversize, vintage, casamiento, monocromático, etc.
    """

    # mando la imagen y el prompt a Gemini
    response = model.generate_content([
        {"mime_type": mime_type, "data": image_bytes},
        prompt
    ])

    # parseo la respuesta y devuelvo una lista de tags limpios
    raw = response.text.strip()
    tags = [tag.strip().lower() for tag in raw.split(",") if tag.strip()]
    return tags[:10]  # maximo 10 tags