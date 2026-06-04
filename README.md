# NQ Taxi 🚕

A full-featured ride-hailing platform built with Django REST Framework (backend) and React (frontend).

## Project Structure

```
NQTaxi/
├── backend/                    # Django REST API
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variables template
│   ├── nqtaxi/                 # Project configuration
│   │   ├── __init__.py
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py             # WSGI entry point
│   │   ├── asgi.py             # ASGI entry point (WebSockets)
│   │   └── celery.py           # Celery async task configuration
│   └── apps/                   # Django applications
│       ├── users/              # Authentication, profiles, addresses
│       ├── drivers/            # Driver profiles, vehicles, documents
│       ├── rides/              # Ride booking, tracking, ratings
│       ├── payments/           # Transactions, wallet, invoices
│       └── notifications/      # Push, SMS, in-app notifications
├── frontend/                   # React/Next.js frontend (to be initialized)
├── .gitignore
└── README.md
```

## Backend Setup

### Prerequisites
- Python 3.10+
- Redis (for Celery & WebSockets)
- PostgreSQL (production) or SQLite (development)

### Installation

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up environment variables
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
# Edit .env with your configuration

# 6. Run migrations
python manage.py migrate

# 7. Create superuser
python manage.py createsuperuser

# 8. Run development server
python manage.py runserver
```

### API Documentation
Once the server is running:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Admin Panel**: http://localhost:8000/admin/

### API Endpoints

| Module         | Base URL                    | Description                        |
|---------------|-----------------------------|------------------------------------|
| Users          | `/api/v1/users/`           | Auth, profiles, addresses          |
| Drivers        | `/api/v1/drivers/`         | Driver profiles, vehicles, docs    |
| Rides          | `/api/v1/rides/`           | Booking, tracking, ratings         |
| Payments       | `/api/v1/payments/`        | Transactions, wallet, invoices     |
| Notifications  | `/api/v1/notifications/`   | Push, in-app notifications         |

### WebSocket Endpoints

| Endpoint                                  | Description                    |
|------------------------------------------|--------------------------------|
| `ws/rides/<ride_id>/track/`              | Real-time ride GPS tracking    |
| `ws/notifications/`                       | Real-time user notifications   |

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - REST API
- **Simple JWT** - Token authentication
- **Channels** - WebSocket support
- **Celery** - Async task queue
- **Redis** - Caching & message broker
- **drf-spectacular** - API documentation

### Frontend (Planned)
- **React.js** / **Next.js**
- **Google Maps API** - Maps & navigation

## License
Private - NQ Taxi
