import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./src/db.js";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  app.use(express.json());

  // --- API Routes ---

  // Auth (Mock for now, real would use session/JWT)
  app.post("/api/auth/login", (req, res) => {
    const { email, role, name } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      const id = uuidv4();
      db.prepare("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)")
        .run(id, name || email.split('@')[0], email, role || 'buyer');
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    }
    res.json(user);
  });

  app.patch("/api/users/:userId", (req, res) => {
    const { userId } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });
    
    const setClause = fields.map(f => `${f} = ?`).join(", ");
    db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, userId);
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    res.json(user);
  });

  app.get("/api/delivery-partners", (req, res) => {
    const partners = db.prepare("SELECT id, name, vehicleType, rating FROM users WHERE role = 'delivery'").all();
    res.json(partners);
  });

  // Products
  app.get("/api/products", (req, res) => {
    const { category, seller_id } = req.query;
    let query = "SELECT p.*, u.name as seller_name FROM products p JOIN users u ON p.seller_id = u.id WHERE p.availability = 1";
    const params = [];
    
    if (category) {
      query += " AND p.category = ?";
      params.push(category);
    }
    if (seller_id) {
      query += " AND p.seller_id = ?";
      params.push(seller_id);
    }
    
    const products = db.prepare(query).all(...params);
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { seller_id, name, description, price, category, image } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO products (id, seller_id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, seller_id, name, description, price, category, image);
    res.json({ id });
  });

  // Orders
  app.post("/api/orders", (req, res) => {
    const { buyer_id, seller_id, items, total_amount, delivery_address } = req.body;
    const orderId = uuidv4();
    
    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO orders (id, buyer_id, seller_id, total_amount, delivery_address, items) VALUES (?, ?, ?, ?, ?, ?)")
        .run(orderId, buyer_id, seller_id, total_amount, delivery_address, JSON.stringify(items));
      
      for (const item of items) {
        db.prepare("INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)")
          .run(uuidv4(), orderId, item.product_id, item.quantity, item.price);
      }
    });
    
    transaction();
    
    const order = db.prepare("SELECT o.*, u.name as seller_name FROM orders o JOIN users u ON o.seller_id = u.id WHERE o.id = ?").get(orderId);
    io.emit(`order_update_${seller_id}`, { type: 'new_order', order });
    res.json(order);
  });

  app.get("/api/orders/user/:userId", (req, res) => {
    const { userId } = req.params;
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId);
    
    let query = "";
    if (user.role === 'buyer') {
      query = "SELECT o.*, u.name as seller_name FROM orders o JOIN users u ON o.seller_id = u.id WHERE o.buyer_id = ?";
    } else if (user.role === 'seller') {
      query = "SELECT o.*, u.name as buyer_name FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.seller_id = ?";
    } else {
      query = "SELECT o.*, u1.name as buyer_name, u2.name as seller_name FROM orders o JOIN users u1 ON o.buyer_id = u1.id JOIN users u2 ON o.seller_id = u2.id WHERE o.delivery_id = ? OR o.status = 'ready'";
    }
    
    const orders = db.prepare(query).all(userId);
    res.json(orders);
  });

  app.patch("/api/orders/:orderId/status", (req, res) => {
    const { orderId } = req.params;
    const { status, delivery_id } = req.body;
    
    if (delivery_id) {
      db.prepare("UPDATE orders SET status = ?, delivery_id = ? WHERE id = ?")
        .run(status, delivery_id, orderId);
    } else {
      db.prepare("UPDATE orders SET status = ? WHERE id = ?")
        .run(status, orderId);
    }
    
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    io.emit(`order_update_${order.buyer_id}`, { type: 'status_change', order });
    io.emit(`order_update_${order.seller_id}`, { type: 'status_change', order });
    if (order.delivery_id) {
      io.emit(`order_update_${order.delivery_id}`, { type: 'status_change', order });
    }
    
    res.json(order);
  });

  // Messages
  app.get("/api/messages/:userId/:otherId", (req, res) => {
    const { userId, otherId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
      OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherId, otherId, userId);
    res.json(messages);
  });

  // --- Socket.io ---
  io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
      const { sender_id, receiver_id, content } = data;
      const id = uuidv4();
      db.prepare("INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)")
        .run(id, sender_id, receiver_id, content);
      
      const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(id);
      io.emit(`message_${receiver_id}`, message);
      socket.emit(`message_sent`, message);
    });
  });

  // --- Vite / Static Files ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
