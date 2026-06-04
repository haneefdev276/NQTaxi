"""
NQ Taxi - Rides App
====================
Core ride lifecycle: booking, matching, tracking, completion, and rating.
"""

import uuid
from django.db import models
from django.conf import settings


class Ride(models.Model):
    """A ride request from a rider, assigned to a driver."""

    class Status(models.TextChoices):
        REQUESTED = 'REQUESTED', 'Requested'
        SEARCHING = 'SEARCHING', 'Searching Driver'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        DRIVER_ARRIVED = 'DRIVER_ARRIVED', 'Driver Arrived'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class VehicleType(models.TextChoices):
        SEDAN = 'SEDAN', 'Sedan'
        SUV = 'SUV', 'SUV'
        HATCHBACK = 'HATCHBACK', 'Hatchback'
        AUTO = 'AUTO', 'Auto Rickshaw'
        BIKE = 'BIKE', 'Bike'
        PREMIUM = 'PREMIUM', 'Premium'

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        ONLINE = 'ONLINE', 'Online'
        WALLET = 'WALLET', 'Wallet'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rides_as_rider',
    )
    driver = models.ForeignKey(
        'drivers.DriverProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rides_as_driver',
    )
    vehicle_type = models.CharField(max_length=15, choices=VehicleType.choices)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.REQUESTED)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH)

    # Locations
    pickup_address = models.TextField()
    pickup_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_address = models.TextField()
    dropoff_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    dropoff_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Distance & Duration
    estimated_distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    actual_distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    actual_duration_minutes = models.PositiveIntegerField(null=True, blank=True)

    # Fare
    estimated_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    surge_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)

    # Cancellation
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_rides',
    )
    cancellation_reason = models.TextField(blank=True, null=True)

    # OTP for ride start verification
    ride_otp = models.CharField(max_length=6, blank=True, null=True)

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rides'
        ordering = ['-requested_at']

    def __str__(self):
        return f'Ride {self.id} - {self.status}'


class RideTracking(models.Model):
    """GPS breadcrumbs captured during a ride for route visualization."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='tracking_points')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ride_tracking'
        ordering = ['timestamp']


class RideRating(models.Model):
    """Post-ride ratings and reviews."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.OneToOneField(Ride, on_delete=models.CASCADE, related_name='rating')
    rated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given',
    )
    rating = models.PositiveSmallIntegerField()  # 1-5
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ride_ratings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Rating for ride {self.ride.id}: {self.rating}/5'
