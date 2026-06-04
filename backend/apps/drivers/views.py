from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DriverProfile, Vehicle, DriverDocument
from .serializers import (
    DriverProfileSerializer,
    VehicleSerializer,
    DriverDocumentSerializer,
    DriverLocationUpdateSerializer,
)


class DriverProfileView(generics.RetrieveUpdateAPIView):
    """View and update driver profile."""
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = DriverProfile.objects.get_or_create(user=self.request.user)
        return profile


class VehicleListCreateView(generics.ListCreateAPIView):
    """List and register vehicles."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(driver__user=self.request.user)

    def perform_create(self, serializer):
        driver_profile = DriverProfile.objects.get(user=self.request.user)
        serializer.save(driver=driver_profile)


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a vehicle."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(driver__user=self.request.user)


class DriverDocumentListCreateView(generics.ListCreateAPIView):
    """List and upload driver documents."""
    serializer_class = DriverDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DriverDocument.objects.filter(driver__user=self.request.user)

    def perform_create(self, serializer):
        driver_profile = DriverProfile.objects.get(user=self.request.user)
        serializer.save(driver=driver_profile)


class DriverLocationUpdateView(APIView):
    """Update driver's live GPS location."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DriverLocationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response(
                {'detail': 'Driver profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile.current_latitude = serializer.validated_data['latitude']
        profile.current_longitude = serializer.validated_data['longitude']
        profile.last_location_update = timezone.now()
        profile.save(update_fields=['current_latitude', 'current_longitude', 'last_location_update'])

        return Response({'detail': 'Location updated successfully.'})


class ToggleAvailabilityView(APIView):
    """Toggle driver online/offline status."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.driver_profile
        except DriverProfile.DoesNotExist:
            return Response(
                {'detail': 'Driver profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get('status')
        if new_status not in ['ONLINE', 'OFFLINE']:
            return Response(
                {'detail': 'Status must be ONLINE or OFFLINE.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.availability_status = new_status
        profile.save(update_fields=['availability_status'])
        return Response({'status': profile.availability_status})
