from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification, DeviceToken
from .serializers import NotificationSerializer, DeviceTokenSerializer


class NotificationListView(generics.ListAPIView):
    """List notifications for the authenticated user."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """Mark a notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {'detail': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'detail': 'Notification marked as read.'})


class MarkAllNotificationsReadView(APIView):
    """Mark all notifications as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'All notifications marked as read.'})


class UnreadNotificationCountView(APIView):
    """Get count of unread notifications."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


class RegisterDeviceTokenView(generics.CreateAPIView):
    """Register a device token for push notifications."""
    serializer_class = DeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]
