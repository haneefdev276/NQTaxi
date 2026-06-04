"""
NQ Taxi - Drivers App
======================
Manages driver profiles, vehicle details, documents, availability, and live location.
"""

import uuid
from django.db import models
from django.conf import settings


class DriverProfile(models.Model):
    """Extended profile for users with DRIVER role."""

    class AvailabilityStatus(models.TextChoices):
        ONLINE = 'ONLINE', 'Online'
        OFFLINE = 'OFFLINE', 'Offline'
        ON_RIDE = 'ON_RIDE', 'On Ride'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driver_profile',
    )
    license_number = models.CharField(max_length=50, unique=True)
    license_expiry = models.DateField()
    availability_status = models.CharField(
        max_length=10,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.OFFLINE,
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_rides = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Live location
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)

    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'driver_profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f'Driver: {self.user.full_name} ({self.license_number})'


class Vehicle(models.Model):
    """Vehicle registered by a driver."""

    class VehicleType(models.TextChoices):
        SEDAN = 'SEDAN', 'Sedan'
        SUV = 'SUV', 'SUV'
        HATCHBACK = 'HATCHBACK', 'Hatchback'
        AUTO = 'AUTO', 'Auto Rickshaw'
        BIKE = 'BIKE', 'Bike'
        PREMIUM = 'PREMIUM', 'Premium'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='vehicles')
    vehicle_type = models.CharField(max_length=15, choices=VehicleType.choices)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=50)
    registration_number = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.make} {self.model} ({self.registration_number})'


class DriverDocument(models.Model):
    """Documents uploaded by drivers for verification."""

    class DocumentType(models.TextChoices):
        LICENSE = 'LICENSE', 'Driving License'
        REGISTRATION = 'REGISTRATION', 'Vehicle Registration'
        INSURANCE = 'INSURANCE', 'Insurance'
        AADHAR = 'AADHAR', 'Aadhar Card'
        PAN = 'PAN', 'PAN Card'

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=15, choices=DocumentType.choices)
    document_file = models.FileField(upload_to='driver_documents/')
    verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    rejection_reason = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'driver_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f'{self.driver.user.full_name} - {self.get_document_type_display()}'
