from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from .serializers import UserSerializer

# helpers
from django.shortcuts import get_object_or_404
from project.utils import get_attr_or_400


@api_view(['POST'])
@transaction.atomic
def signUp(request) :
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid() :
        serializer.save()
        
        return Response({
            "status": "success",
            "message": "user signed up sucessfully",
            "data": serializer.data
        }, status.HTTP_201_CREATED)
        
    return Response({
        "status": "fail",
        "message": "Error occured while signing up",
        "errors": serializer.errors
    }, status.HTTP_400_BAD_REQUEST)
    
