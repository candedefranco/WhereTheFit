import os
import json
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


def suggest_similar_links(title: str, description: str, tags: str, category: str, image_bytes: bytes = None, mime_type: str = None) -> list[dict]:
    """
    Le pide a Gemini que sugiera links de paginas web reales donde comprar
    prendas similares a las del post. Devuelve una lista de dicts con
    {name, url, description}.
    """
    prompt = f"""
    Sos un asistente de moda argentino. Un usuario está buscando esta prenda:

    Título: "{title}"
    Descripción: "{description}"
    Categoría: {category or "sin especificar"}
    Tags/Estilos: {tags or "sin especificar"}

    Sugerí entre 3 y 5 páginas web REALES de tiendas online (argentinas o internacionales con envío a Argentina) donde el usuario podría encontrar prendas similares.

    Para cada sugerencia incluí:
    - name: nombre de la tienda
    - url: link directo a la sección relevante del sitio (no un link genérico a la home)
    - description: breve explicación de por qué esa tienda es relevante (1 oración)

    Respondé ÚNICAMENTE con un JSON array válido, sin markdown, sin explicaciones fuera del JSON.
    Ejemplo:
    [
      {{"name": "Zara Argentina", "url": "https://www.zara.com/ar/es/mujer-abrigos-l1776.html", "description": "Tiene una sección amplia de abrigos con estilos similares."}},
      {{"name": "Dafiti", "url": "https://www.dafiti.com.ar/camperas-mujer/", "description": "Marketplace con variedad de camperas de distintas marcas."}}
    ]
    """

    contents = []
    if image_bytes and mime_type:
        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
    contents.append(prompt)

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=contents
    )

    # parseo el JSON de la respuesta
    raw = response.text.strip()
    # limpio posibles backticks de markdown
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    try:
        links = json.loads(raw)
        # valido que sea una lista de dicts con los campos esperados
        result = []
        for item in links[:5]:
            if isinstance(item, dict) and "name" in item and "url" in item:
                result.append({
                    "name": item["name"],
                    "url": item["url"],
                    "description": item.get("description", ""),
                })
        return result
    except (json.JSONDecodeError, TypeError):
        return []