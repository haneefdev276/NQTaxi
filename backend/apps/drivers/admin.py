from django.contrib import admin
from .models import DriverProfile, Vehicle, DriverDocument


@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'availability_status', 'rating', 'total_rides', 'is_approved']
    list_filter = ['availability_status', 'is_approved']
    search_fields = ['user__email', 'user__first_name', 'license_number']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'driver', 'vehicle_type', 'make', 'model', 'is_active']
    list_filter = ['vehicle_type', 'is_active']
    search_fields = ['registration_number', 'make', 'model']


@admin.register(DriverDocument)
class DriverDocumentAdmin(admin.ModelAdmin):
    list_display = ['driver', 'document_type', 'verification_status', 'uploaded_at']
    list_filter = ['document_type', 'verification_status']
