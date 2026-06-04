from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark-read'),
    path('read-all/', views.MarkAllNotificationsReadView.as_view(), name='mark-all-read'),
    path('unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-count'),
    path('device-token/', views.RegisterDeviceTokenView.as_view(), name='register-device'),
]
