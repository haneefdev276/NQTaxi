"""
NQ Taxi - Notifications App
=============================
Manages push notifications, SMS, email, and in-app notifications.
"""

import uuid
from django.db import models
from django.conf import settings


class Notification(models.Model):
    """In-app notification for users."""

    class Type(models.TextChoices):
        RIDE_REQUEST = 'RIDE_REQUEST', 'Ride Request'
        RIDE_ACCEPTED = 'RIDE_ACCEPTED', 'Ride Accepted'
        DRIVER_ARRIVED = 'DRIVER_ARRIVED', 'Driver Arrived'
        RIDE_STARTED = 'RIDE_STARTED', 'Ride Started'
        RIDE_COMPLETED = 'RIDE_COMPLETED', 'Ride Completed'
        RIDE_CANCELLED = 'RIDE_CANCELLED', 'Ride Cancelled'
        PAYMENT = 'PAYMENT', 'Payment'
        PROMO = 'PROMO', 'Promotion'
        SYSTEM = 'SYSTEM', 'System'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(blank=True, null=True)  # Additional payload (e.g., ride_id)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.notification_type} - {self.title}'


class DeviceToken(models.Model):
    """FCM/APNs device tokens for push notifications."""

    class Platform(models.TextChoices):
        ANDROID = 'ANDROID', 'Android'
        IOS = 'IOS', 'iOS'
        WEB = 'WEB', 'Web'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='device_tokens',
    )
    token = models.TextField(unique=True)
    platform = models.CharField(max_length=10, choices=Platform.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'device_tokens'

    def __str__(self):
        return f'{self.user.full_name} - {self.platform}'
