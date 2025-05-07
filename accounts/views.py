from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.db import transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode


from .serializers import (UserSerializer, TokenObtainPairSerializer__,
                          TokenRefreshSerializer__)
from .models import User
from .utils import send_verification_email

# helpers
from django.shortcuts import get_object_or_404
from project.utils import get_attr_or_400
from drf_yasg.utils import swagger_auto_schema


@api_view(['POST'])
@transaction.atomic
def signUp(request) :
    serializer = UserSerializer(data=request.data)
    password = get_attr_or_400(request, 'password')
    
    if serializer.is_valid() :
        user = serializer.save()
        user.is_active = False
        user.save()
        
        refresh = RefreshToken.for_user(user)
        send_verification_email(user)
        
        return Response({
            "status": "success",
            "message": "user signed up sucessfully, check you email for verification",
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


@api_view(['GET'])
def verify_email(request, uidb64, token) :
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(id=uid)
        # NOTE : i should handle the case that user is not exists via a util for cleaner code
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({"message": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)

    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({
                "status": "success",
                "message": "Email verified successfully!",
                "data": UserSerializer(user).data
            },status=status.HTTP_200_OK)
    else:
        return Response({
                "status": "fail",
                "message": "Invalid or expired token.",
                "error":  "Invalid or expired token."
            }, status=status.HTTP_400_BAD_REQUEST)


class TokenObtainPairView__(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer__
    
class TokenRefreshView__(TokenRefreshView):
    serializer_class = TokenRefreshSerializer__
