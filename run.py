from app import create_app

# creo la app usando la funcion que defini en app/__init__.py
app = create_app()

if __name__ == "__main__":
    # arranca el servidor en modo debug en el puerto 5001
    # el modo debug recarga el servidor automaticamente cuando hay cambios
    app.run(debug=True, port=5001)

