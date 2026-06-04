from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Transaction, Wallet, WalletTransaction, Invoice
from .serializers import (
    TransactionSerializer,
    WalletSerializer,
    WalletTransactionSerializer,
    WalletTopUpSerializer,
    InvoiceSerializer,
)


class TransactionListView(generics.ListAPIView):
    """List transactions for the authenticated user."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(payer=self.request.user)


class TransactionDetailView(generics.RetrieveAPIView):
    """Retrieve transaction details."""
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(payer=self.request.user)


class WalletView(APIView):
    """Get wallet balance."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data)


class WalletTopUpView(APIView):
    """Top up wallet balance."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WalletTopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        amount = serializer.validated_data['amount']

        # TODO: Integrate with payment gateway for actual top-up
        wallet.balance += amount
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type=WalletTransaction.Type.CREDIT,
            amount=amount,
            description='Wallet top-up',
        )

        return Response({
            'detail': 'Wallet topped up successfully.',
            'balance': str(wallet.balance),
        })


class WalletTransactionListView(generics.ListAPIView):
    """List wallet transaction history."""
    serializer_class = WalletTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wallet = Wallet.objects.filter(user=self.request.user).first()
        if wallet:
            return WalletTransaction.objects.filter(wallet=wallet)
        return WalletTransaction.objects.none()


class InvoiceDetailView(generics.RetrieveAPIView):
    """Retrieve invoice for a ride."""
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'ride_id'

    def get_queryset(self):
        return Invoice.objects.filter(ride__rider=self.request.user)
