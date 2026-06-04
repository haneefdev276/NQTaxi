from rest_framework import serializers
from .models import DriverProfile, Vehicle, DriverDocument


class DriverProfileSerializer(serializers.ModelSerializer):
    """Serializer for driver profile."""
    driver_name = serializers.CharField(source='user.full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = DriverProfile
        fields = [
            'id', 'driver_name', 'email', 'phone', 'license_number',
            'license_expiry', 'availability_status', 'rating', 'total_rides',
            'total_earnings', 'current_latitude', 'current_longitude',
            'is_approved', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'rating', 'total_rides', 'total_earnings',
            'is_approved', 'created_at', 'updated_at',
        ]


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer for vehicle details."""

    class Meta:
        model = Vehicle
        fields = [
            'id', 'vehicle_type', 'make', 'model', 'year',
            'color', 'registration_number', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class DriverDocumentSerializer(serializers.ModelSerializer):
    """Serializer for driver documents."""

    class Meta:
        model = DriverDocument
        fields = [
            'id', 'document_type', 'document_file',
            'verification_status', 'rejection_reason',
            'uploaded_at', 'verified_at',
        ]
        read_only_fields = ['id', 'verification_status', 'rejection_reason', 'uploaded_at', 'verified_at']


class DriverLocationUpdateSerializer(serializers.Serializer):
    """Serializer for updating driver's live location."""
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
