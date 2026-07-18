#!/bin/bash
# deploy/redeploy.sh
# script para actualizar la app despues de pushear cambios
# correr en el EC2: ./deploy/redeploy.sh

set -e

cd /home/ubuntu/WhereTheFit

echo "=== Pulling cambios ==="
git pull origin main

echo "=== Actualizando backend ==="
source venv/bin/activate
pip install -r requirements.txt

echo "=== Rebuilding frontend ==="
cd wtf-front
npm install
npm run build
sudo rm -rf /var/www/wherethefit
sudo mkdir -p /var/www/wherethefit
sudo cp -r dist/* /var/www/wherethefit/
cd ..

echo "=== Reiniciando servicios ==="
sudo systemctl restart wherethefit
sudo systemctl restart wherethefit-ws
sudo systemctl restart nginx

echo "=== Redeploy completo! ==="
