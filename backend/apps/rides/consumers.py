"""
NQ Taxi - Rides WebSocket Consumers
=====================================
Real-time ride tracking via WebSockets.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer


class RideTrackingConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time ride location tracking."""

    async def connect(self):
        self.ride_id = self.scope['url_route']['kwargs']['ride_id']
        self.room_group_name = f'ride_{self.ride_id}'

        # Join ride tracking group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave ride tracking group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        """Receive location update from driver."""
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'location_update',
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'timestamp': data.get('timestamp'),
            }
        )

    async def location_update(self, event):
        """Broadcast location update to all group members."""
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'latitude': event['latitude'],
            'longitude': event['longitude'],
            'timestamp': event['timestamp'],
        }))

    async def ride_status_update(self, event):
        """Broadcast ride status change to all group members."""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'status': event['status'],
            'message': event.get('message', ''),
        }))
