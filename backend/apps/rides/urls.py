from django.urls import path
from . import views

app_name = 'rides'

urlpatterns = [
    path('book/', views.RideBookingView.as_view(), name='book'),
    path('', views.RideListView.as_view(), name='ride-list'),
    path('<uuid:pk>/', views.RideDetailView.as_view(), name='ride-detail'),
    path('<uuid:ride_id>/cancel/', views.CancelRideView.as_view(), name='cancel-ride'),
    path('rate/', views.RateRideView.as_view(), name='rate-ride'),
    path('fare-estimate/', views.FareEstimateView.as_view(), name='fare-estimate'),
]
