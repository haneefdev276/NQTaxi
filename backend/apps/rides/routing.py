"""
NQ Taxi - Rides WebSocket Routing
==================================
WebSocket URLs for real-time ride tracking.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/rides/(?P<ride_id>[0-9a-f-]+)/track/$', consumers.RideTrackingConsumer.as_asgi()),
]
