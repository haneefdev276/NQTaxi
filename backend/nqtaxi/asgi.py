"""
NQ Taxi - ASGI Configuration
=============================
Supports both HTTP and WebSocket protocols for real-time ride tracking.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nqtaxi.settings')

django_asgi_app = get_asgi_application()

# Import websocket URL patterns after Django setup
from apps.rides.routing import websocket_urlpatterns as ride_ws_patterns
from apps.notifications.routing import websocket_urlpatterns as notification_ws_patterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            ride_ws_patterns + notification_ws_patterns
        )
    ),
})
