"""
NQ Taxi - Payments App
=======================
Handles transactions, wallet, invoices, and payment gateway integration.
"""

import uuid
from django.db import models
from django.conf import settings


class Transaction(models.Model):
    """Payment transaction for a completed ride."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    class PaymentGateway(models.TextChoices):
        RAZORPAY = 'RAZORPAY', 'Razorpay'
        STRIPE = 'STRIPE', 'Stripe'
        CASH = 'CASH', 'Cash'
        WALLET = 'WALLET', 'Wallet'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.OneToOneField('rides.Ride', on_delete=models.CASCADE, related_name='transaction')
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions_made',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    payment_gateway = models.CharField(max_length=10, choices=PaymentGateway.choices)
    gateway_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    gateway_response = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f'Transaction {self.id} - {self.amount} {self.currency} ({self.status})'


class Wallet(models.Model):
    """User wallet for in-app payments."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet',
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f'{self.user.full_name} - Balance: {self.balance}'


class WalletTransaction(models.Model):
    """Log of wallet credits and debits."""

    class Type(models.TextChoices):
        CREDIT = 'CREDIT', 'Credit'
        DEBIT = 'DEBIT', 'Debit'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=6, choices=Type.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    reference_id = models.UUIDField(null=True, blank=True)  # Link to ride/transaction
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.transaction_type} - {self.amount}'


class Invoice(models.Model):
    """Invoice generated for a completed ride."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ride = models.OneToOneField('rides.Ride', on_delete=models.CASCADE, related_name='invoice')
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    base_fare = models.DecimalField(max_digits=10, decimal_places=2)
    distance_charge = models.DecimalField(max_digits=10, decimal_places=2)
    time_charge = models.DecimalField(max_digits=10, decimal_places=2)
    surge_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f'Invoice {self.invoice_number}'
