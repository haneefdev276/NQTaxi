import random
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ride, RideRating
from .serializers import (
    RideBookingSerializer,
    RideDetailSerializer,
    RideRatingSerializer,
    FareEstimateSerializer,
)


class RideBookingView(generics.CreateAPIView):
    """Book a new ride."""
    serializer_class = RideBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Generate a 4-digit OTP for ride verification
        otp = str(random.randint(1000, 9999))
        serializer.save(rider=self.request.user, ride_otp=otp)


class RideListView(generics.ListAPIView):
    """List rides for the authenticated user (rider or driver)."""
    serializer_class = RideDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driver_profile'):
            return Ride.objects.filter(driver=user.driver_profile)
        return Ride.objects.filter(rider=user)


class RideDetailView(generics.RetrieveAPIView):
    """Get details of a specific ride."""
    serializer_class = RideDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Ride.objects.filter(
            models.Q(rider=user) | models.Q(driver__user=user)
        )


class CancelRideView(APIView):
    """Cancel an ongoing ride."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(id=ride_id)
        except Ride.DoesNotExist:
            return Response({'detail': 'Ride not found.'}, status=status.HTTP_404_NOT_FOUND)

        if ride.status in [Ride.Status.COMPLETED, Ride.Status.CANCELLED]:
            return Response(
                {'detail': 'Cannot cancel a completed or already cancelled ride.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ride.status = Ride.Status.CANCELLED
        ride.cancelled_by = request.user
        ride.cancellation_reason = request.data.get('reason', '')
        ride.save()
        return Response({'detail': 'Ride cancelled successfully.'})


class RateRideView(generics.CreateAPIView):
    """Rate a completed ride."""
    serializer_class = RideRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(rated_by=self.request.user)


class FareEstimateView(APIView):
    """Get fare estimate for a route."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FareEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: Implement actual fare calculation logic with distance API
        # Placeholder estimate
        data = serializer.validated_data
        return Response({
            'estimated_fare': '0.00',
            'surge_multiplier': 1.0,
            'vehicle_type': data['vehicle_type'],
            'message': 'Fare calculation engine not yet implemented.',
        })
