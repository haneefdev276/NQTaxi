from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserAddress

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone_number', 'first_name', 'last_name',
            'role', 'password', 'password_confirm',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating user profiles."""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone_number', 'first_name', 'last_name',
            'full_name', 'role', 'profile_picture', 'is_verified',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'created_at', 'updated_at']


class UserAddressSerializer(serializers.ModelSerializer):
    """Serializer for user saved addresses."""

    class Meta:
        model = UserAddress
        fields = [
            'id', 'label', 'address_type', 'address_line',
            'latitude', 'longitude', 'is_default', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
