import asyncio
from app.ws import start_ws_server

if __name__ == '__main__':
    asyncio.run(start_ws_server())
