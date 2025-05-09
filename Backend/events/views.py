from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import EventSerializer
from .models import Event
from .permissions import EventPermission


# utils
from django.shortcuts import get_object_or_404
from project.viewsets import AreebViewSet


class EventViewSet(AreebViewSet) :
    permission_classes = [EventPermission]
    serializer_class = EventSerializer
    queryset = Event.objects.all()