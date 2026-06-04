from rest_framework import serializers
from .models import Ride, RideTracking, RideRating


class RideBookingSerializer(serializers.ModelSerializer):
    """Serializer for creating a new ride request."""

    class Meta:
        model = Ride
        fields = [
            'id', 'vehicle_type', 'payment_method',
            'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
        ]
        read_only_fields = ['id']


class RideDetailSerializer(serializers.ModelSerializer):
    """Full ride detail serializer."""
    rider_name = serializers.CharField(source='rider.full_name', read_only=True)
    driver_name = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = [
            'id', 'rider', 'rider_name', 'driver', 'driver_name',
            'vehicle_type', 'status', 'payment_method',
            'pickup_address', 'pickup_latitude', 'pickup_longitude',
            'dropoff_address', 'dropoff_latitude', 'dropoff_longitude',
            'estimated_distance_km', 'actual_distance_km',
            'estimated_duration_minutes', 'actual_duration_minutes',
            'estimated_fare', 'actual_fare', 'surge_multiplier',
            'ride_otp', 'requested_at', 'accepted_at',
            'started_at', 'completed_at', 'cancelled_at',
        ]
        read_only_fields = fields

    def get_driver_name(self, obj):
        return obj.driver.user.full_name if obj.driver else None


class RideTrackingSerializer(serializers.ModelSerializer):
    """Serializer for ride GPS tracking points."""

    class Meta:
        model = RideTracking
        fields = ['id', 'latitude', 'longitude', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class RideRatingSerializer(serializers.ModelSerializer):
    """Serializer for ride ratings."""

    class Meta:
        model = RideRating
        fields = ['id', 'ride', 'rating', 'review', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class FareEstimateSerializer(serializers.Serializer):
    """Serializer for fare estimation request."""
    pickup_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    dropoff_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    dropoff_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    vehicle_type = serializers.ChoiceField(choices=Ride.VehicleType.choices)
