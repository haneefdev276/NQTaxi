from rest_framework import serializers
from .models import Transaction, Wallet, WalletTransaction, Invoice


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions."""

    class Meta:
        model = Transaction
        fields = [
            'id', 'ride', 'payer', 'amount', 'currency',
            'status', 'payment_gateway', 'gateway_transaction_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'gateway_transaction_id',
            'created_at', 'updated_at',
        ]


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for user wallet."""

    class Meta:
        model = Wallet
        fields = ['id', 'balance', 'updated_at']
        read_only_fields = fields


class WalletTransactionSerializer(serializers.ModelSerializer):
    """Serializer for wallet transaction history."""

    class Meta:
        model = WalletTransaction
        fields = ['id', 'transaction_type', 'amount', 'description', 'created_at']
        read_only_fields = fields


class WalletTopUpSerializer(serializers.Serializer):
    """Serializer for wallet top-up requests."""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for ride invoices."""

    class Meta:
        model = Invoice
        fields = [
            'id', 'ride', 'invoice_number', 'base_fare',
            'distance_charge', 'time_charge', 'surge_charge',
            'discount', 'tax', 'total_amount', 'created_at',
        ]
        read_only_fields = fields
