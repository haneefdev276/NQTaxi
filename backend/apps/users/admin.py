from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import UserAddress

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified', 'created_at']
    list_filter = ['role', 'is_active', 'is_verified']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'label', 'address_type', 'is_default']
    list_filter = ['address_type', 'is_default']
    search_fields = ['user__email', 'label', 'address_line']
