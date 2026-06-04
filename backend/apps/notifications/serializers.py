from rest_framework import serializers
from .models import Notification, DeviceToken


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'data', 'is_read', 'created_at',
        ]
        read_only_fields = fields


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for registering device tokens."""

    class Meta:
        model = DeviceToken
        fields = ['id', 'token', 'platform', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Update existing token or create new
        token, created = DeviceToken.objects.update_or_create(
            token=validated_data['token'],
            defaults=validated_data,
        )
        return token
