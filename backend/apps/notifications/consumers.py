"""
NQ Taxi - Notification WebSocket Consumer
==========================================
Real-time notification delivery via WebSockets.
"""

import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time user notifications."""

    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
            return

        self.group_name = f'notifications_{self.user.id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def send_notification(self, event):
        """Send notification to WebSocket client."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'title': event['title'],
            'message': event['message'],
            'notification_type': event.get('notification_type', 'SYSTEM'),
            'data': event.get('data', {}),
        }))
