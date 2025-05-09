from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import User


class UserSerializer(serializers.ModelSerializer) :
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    class Meta : 
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'password',
        ]
        read_only_fields = ['id', 'role']
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
        
        

class TokenObtainPairSerializer__(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        return {
            "status": 200,
            "message": "Login successful",
            "user": UserSerializer(self.user).data,
            "tokens": {
                "access": data["access"],
                "refresh": data["refresh"]
            }
        }


class TokenRefreshSerializer__(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return {
            "status": 200,
            "message": "Token refreshed successfully",
            "tokens": {
                "access": data["access"]
            }
        }
