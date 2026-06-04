from django.urls import path
from . import views

app_name = 'drivers'

urlpatterns = [
    # Profile
    path('profile/', views.DriverProfileView.as_view(), name='profile'),

    # Vehicles
    path('vehicles/', views.VehicleListCreateView.as_view(), name='vehicle-list'),
    path('vehicles/<uuid:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),

    # Documents
    path('documents/', views.DriverDocumentListCreateView.as_view(), name='document-list'),

    # Location & Availability
    path('location/', views.DriverLocationUpdateView.as_view(), name='update-location'),
    path('availability/', views.ToggleAvailabilityView.as_view(), name='toggle-availability'),
]
