CREATE DATABASE IF NOT EXISTS customers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS orders_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON customers_db.* TO 'orders_user'@'%';
GRANT ALL PRIVILEGES ON orders_db.* TO 'orders_user'@'%';

FLUSH PRIVILEGES;

SHOW DATABASES;
