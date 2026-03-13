# Gojo Marketplace Django Backend

This is a Django-based backend for the Gojo Marketplace application, providing a REST API and WebSocket support.

## Setup Instructions

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations:**
   ```bash
   python manage.py makemigrations api
   python manage.py migrate
   ```

4. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the development server:**
   ```bash
   python manage.py runserver 8000
   ```

## API Endpoints

- `GET /api/products/`: List all available products.
- `POST /api/products/`: Create a new product.
- `GET /api/users/delivery_partners/`: List all delivery partners.
- `GET /api/orders/user/<user_id>/`: Get orders for a specific user.
- `PATCH /api/orders/<order_id>/status/`: Update order status.
- `GET /api/messages/chat/<user_id>/<other_id>/`: Get chat history.

## WebSockets

WebSocket connection for chat: `ws://localhost:8000/ws/chat/<user_id>/`
