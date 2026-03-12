import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'gojo.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('buyer', 'seller', 'delivery')) NOT NULL,
    avatar TEXT,
    location_lat REAL,
    location_lng REAL,
    storeName TEXT,
    bio TEXT,
    phone TEXT,
    address TEXT,
    vehicleType TEXT,
    rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    availability BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    delivery_id TEXT,
    status TEXT CHECK(status IN ('pending', 'accepted', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
    total_amount REAL NOT NULL,
    delivery_address TEXT,
    items TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (delivery_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (target_id) REFERENCES users(id)
  );
`);

// Migrations for existing databases
const addColumn = (table: string, column: string, type: string) => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
  } catch (e) {
    // Column might already exist
  }
};

addColumn('users', 'storeName', 'TEXT');
addColumn('users', 'bio', 'TEXT');
addColumn('users', 'phone', 'TEXT');
addColumn('users', 'address', 'TEXT');
addColumn('users', 'vehicleType', 'TEXT');
addColumn('users', 'rating', 'REAL');
addColumn('orders', 'delivery_address', 'TEXT');
addColumn('orders', 'items', 'TEXT');

export default db;
