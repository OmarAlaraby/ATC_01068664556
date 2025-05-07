from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.db import transaction

from .serializers import UserSerializer, TokenObtainPairSerializer__, TokenRefreshSerializer__

# helpers
from django.shortcuts import get_object_or_404
from project.utils import get_attr_or_400


@api_view(['POST'])
@transaction.atomic
def signUp(request) :
    serializer = UserSerializer(data=request.data)
    password = get_attr_or_400(request, 'password')
    
    if serializer.is_valid() :
        user = serializer.save()
        user.set_password(password)
        user.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "status": "success",
            "message": "user signed up sucessfully",
            "data": serializer.data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }
        }, status.HTTP_201_CREATED)
        
    return Response({
        "status": "fail",
        "message": "Error occured while signing up",
        "errors": serializer.errors
    }, status.HTTP_400_BAD_REQUEST)


class TokenObtainPairView__(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer__
    
class TokenRefreshView__(TokenRefreshView):
    serializer_class = TokenRefreshSerializer__
