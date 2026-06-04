from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Transactions
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<uuid:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),

    # Wallet
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('wallet/topup/', views.WalletTopUpView.as_view(), name='wallet-topup'),
    path('wallet/history/', views.WalletTransactionListView.as_view(), name='wallet-history'),

    # Invoice
    path('invoice/<uuid:ride_id>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),
]
