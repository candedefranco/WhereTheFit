import asyncio
import json
import os
import jwt
import websockets
from dotenv import load_dotenv

# cargo las variables de entorno
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

# diccionario de conexiones activas: user_id -> websocket
connections: dict[int, websockets.WebSocketServerProtocol] = {}


def get_user_id_from_token(token: str) -> int | None:
    """Decodifica el JWT y devuelve el user_id (sub claim)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return int(payload["sub"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, KeyError, ValueError):
        return None


def save_message_to_db(sender_id: int, receiver_id: int, text: str) -> dict | None:
    """Guarda el mensaje en la base de datos usando el contexto de Flask."""
    from app import create_app, db
    from app.models import Message

    app = create_app()
    with app.app_context():
        message = Message(sender_id=sender_id, receiver_id=receiver_id, text=text)
        db.session.add(message)
        db.session.commit()
        return message.to_dict()


async def handler(websocket: websockets.WebSocketServerProtocol) -> None:
    """Maneja cada conexion WebSocket."""
    user_id: int | None = None

    try:
        async for raw_message in websocket:
            try:
                data = json.loads(raw_message)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({"type": "error", "message": "JSON inválido"}))
                continue

            msg_type = data.get("type")

            # autenticacion inicial
            if msg_type == "auth":
                token = data.get("token", "")
                user_id = get_user_id_from_token(token)
                if user_id is None:
                    await websocket.send(json.dumps({"type": "error", "message": "Token inválido"}))
                    await websocket.close()
                    return
                connections[user_id] = websocket
                await websocket.send(json.dumps({"type": "auth_ok", "user_id": user_id}))

            # envio de mensaje
            elif msg_type == "message":
                if user_id is None:
                    await websocket.send(json.dumps({"type": "error", "message": "No autenticado"}))
                    continue

                to_user_id = data.get("to")
                text = data.get("text", "").strip()

                if not to_user_id or not text:
                    await websocket.send(json.dumps({"type": "error", "message": "Faltan campos"}))
                    continue

                # guardo en la base de datos
                saved = await asyncio.to_thread(save_message_to_db, user_id, int(to_user_id), text)

                if saved is None:
                    await websocket.send(json.dumps({"type": "error", "message": "Error al guardar"}))
                    continue

                # notifico al destinatario si esta conectado
                recipient_ws = connections.get(int(to_user_id))
                if recipient_ws is not None:
                    try:
                        await recipient_ws.send(json.dumps({"type": "new_message", "message": saved}))
                    except websockets.ConnectionClosed:
                        del connections[int(to_user_id)]

                # confirmo al sender
                await websocket.send(json.dumps({"type": "message_sent", "message": saved}))

    except websockets.ConnectionClosed:
        pass
    finally:
        # limpio la conexion al desconectarse
        if user_id is not None and connections.get(user_id) == websocket:
            del connections[user_id]


async def start_ws_server() -> None:
    """Inicia el servidor WebSocket en el puerto 5002."""
    print("🚀 WebSocket server corriendo en ws://localhost:5002")
    async with websockets.serve(handler, "localhost", 5002):
        await asyncio.Future()  # corre indefinidamente
