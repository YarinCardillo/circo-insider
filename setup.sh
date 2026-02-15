#!/bin/bash
# Circo Insider - Setup HTTPS su Hetzner
# Usage: sudo bash setup.sh tuodominio.duckdns.org

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: sudo bash setup.sh tuodominio.duckdns.org"
  exit 1
fi

echo "=== Circo Insider - Setup HTTPS ==="
echo "Dominio: $DOMAIN"

# 1. Install certbot if needed
if ! command -v certbot &> /dev/null; then
  echo ">> Installo certbot..."
  apt update && apt install -y certbot
fi

# 2. Stop anything on port 80 temporarily
echo ">> Fermo eventuali processi su porta 80..."
fuser -k 80/tcp 2>/dev/null || true

# 3. Get SSL cert
echo ">> Ottengo certificato SSL..."
certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email

if [ $? -ne 0 ]; then
  echo "ERRORE: certbot fallito. Assicurati che:"
  echo "  1. Il dominio DuckDNS punta al tuo IP"
  echo "  2. La porta 80 e' libera"
  echo "  3. Stai usando sudo"
  exit 1
fi

# 4. Install node if needed
if ! command -v node &> /dev/null; then
  echo ">> Installo Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

# 5. Setup app
echo ">> Setup applicazione..."
cd /opt/circo-insider
npm install

# 6. Kill old instances
echo ">> Fermo vecchie istanze..."
pkill -f "node server.js" 2>/dev/null || true
sleep 1

# 7. Start with HTTPS
echo ">> Avvio server HTTPS..."
DOMAIN="$DOMAIN" PORT=443 nohup node server.js > /var/log/circo-insider.log 2>&1 &

sleep 2

if curl -sk "https://$DOMAIN" > /dev/null 2>&1; then
  echo ""
  echo "=== PRONTO ==="
  echo "Manda questo link su WhatsApp:"
  echo ""
  echo "  https://$DOMAIN"
  echo ""
  echo "Log: tail -f /var/log/circo-insider.log"
  echo "Stop: pkill -f 'node server.js'"
else
  echo "Qualcosa non va. Controlla: tail -f /var/log/circo-insider.log"
fi
