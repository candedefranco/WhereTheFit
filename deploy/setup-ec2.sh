#!/bin/bash
# deploy/setup-ec2.sh
# script para configurar un EC2 con Ubuntu desde cero
# correr como: chmod +x setup-ec2.sh && ./setup-ec2.sh

set -e

echo "=== Actualizando sistema ==="
sudo apt update && sudo apt upgrade -y

echo "=== Instalando dependencias ==="
sudo apt install -y python3 python3-pip python3-venv nginx git nodejs npm

echo "=== Instalando Node.js 20 (para build del frontend) ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Clonando repositorio ==="
cd /home/ubuntu
if [ ! -d "WhereTheFit" ]; then
  git clone https://github.com/TU_USUARIO/WhereTheFit.git
fi
cd WhereTheFit

echo "=== Configurando backend ==="
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

echo "=== Configurando .env ==="
if [ ! -f ".env" ]; then
  echo "IMPORTANTE: Copiá tu archivo .env al servidor"
  echo "scp .env ubuntu@IP_EC2:/home/ubuntu/WhereTheFit/.env"
fi

echo "=== Build del frontend ==="
cd wtf-front
npm install
npm run build
sudo rm -rf /var/www/wherethefit
sudo mkdir -p /var/www/wherethefit
sudo cp -r dist/* /var/www/wherethefit/
cd ..

echo "=== Configurando Nginx ==="
sudo cp deploy/nginx.conf /etc/nginx/sites-available/wherethefit
sudo ln -sf /etc/nginx/sites-available/wherethefit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "=== Configurando servicios systemd ==="
sudo mkdir -p /var/log/wtf
sudo chown ubuntu:www-data /var/log/wtf

sudo cp deploy/wherethefit.service /etc/systemd/system/
sudo cp deploy/wherethefit-ws.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wherethefit wherethefit-ws
sudo systemctl start wherethefit wherethefit-ws

echo "=== Deploy completo! ==="
echo "Backend corriendo en puerto 5001 (gunicorn)"
echo "WebSocket corriendo en puerto 5002"
echo "Nginx sirve frontend en puerto 80"
echo ""
echo "Comandos utiles:"
echo "  sudo systemctl status wherethefit"
echo "  sudo systemctl status wherethefit-ws"
echo "  sudo journalctl -u wherethefit -f"
echo "  sudo systemctl restart wherethefit"
