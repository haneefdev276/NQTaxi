from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),

    # Addresses
    path('addresses/', views.UserAddressListCreateView.as_view(), name='address-list'),
    path('addresses/<uuid:pk>/', views.UserAddressDetailView.as_view(), name='address-detail'),
]
