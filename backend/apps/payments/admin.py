from django.contrib import admin
from .models import Transaction, Wallet, WalletTransaction, Invoice


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'ride', 'payer', 'amount', 'currency', 'status', 'payment_gateway', 'created_at']
    list_filter = ['status', 'payment_gateway', 'currency']
    search_fields = ['payer__email', 'gateway_transaction_id']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'updated_at']
    search_fields = ['user__email']


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'transaction_type', 'amount', 'created_at']
    list_filter = ['transaction_type']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'ride', 'total_amount', 'created_at']
    search_fields = ['invoice_number']
