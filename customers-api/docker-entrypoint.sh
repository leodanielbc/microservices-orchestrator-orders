#!/bin/sh
set -e

# Función para esperar a que MySQL esté disponible
wait_for_db() {
  echo "Iniciando espera a MySQL..."


  DB_HOST=$(echo $DATABASE_URL | awk -F'@' '{print $2}' | awk -F':' '{print $1}')

  DB_USER=$(echo $DATABASE_URL | awk -F'//' '{print $2}' | awk -F':' '{print $1}')

  DB_PASS=$(echo $DATABASE_URL | awk -F':' '{print $3}' | awk -F'@' '{print $1}')

  DB_NAME=$(echo $DATABASE_URL | awk -F'/' '{print $NF}')
  

  if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
      echo "ERROR: Fallo al parsear la DATABASE_URL. HOST=$DB_HOST USER=$DB_USER PASS_LEN=${#DB_PASS}"
      exit 1
  fi

  echo "Intentando conectar a HOST: $DB_HOST como USER: $DB_USER. DB: $DB_NAME"


  while ! mysql --skip-ssl -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" -e "SELECT 1" > /dev/null 2>&1; do
    echo "MySQL no disponible en $DB_HOST (o base de datos $DB_NAME no lista), reintentando..."
    sleep 2
  done
  
  echo "✅ MySQL y la base de datos están listos."
}

wait_for_db

echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "Iniciando la aplicación..."
exec npm start