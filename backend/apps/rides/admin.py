from django.contrib import admin
from .models import Ride, RideTracking, RideRating


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ['id', 'rider', 'driver', 'status', 'vehicle_type', 'actual_fare', 'requested_at']
    list_filter = ['status', 'vehicle_type', 'payment_method']
    search_fields = ['rider__email', 'driver__user__email', 'pickup_address', 'dropoff_address']
    readonly_fields = ['id', 'requested_at']


@admin.register(RideTracking)
class RideTrackingAdmin(admin.ModelAdmin):
    list_display = ['ride', 'latitude', 'longitude', 'timestamp']
    list_filter = ['timestamp']


@admin.register(RideRating)
class RideRatingAdmin(admin.ModelAdmin):
    list_display = ['ride', 'rated_by', 'rating', 'created_at']
    list_filter = ['rating']
