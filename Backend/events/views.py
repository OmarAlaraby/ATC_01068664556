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
    
    def list(self, request, *args, **kwargs):
        print(request.user)
        print(request.auth)
        return super().list(request, *args, **kwargs)
    

# @api_view(['POST'])
# def book_event(request, event_id):
#     event = get_object_or_404(Event, id=event_id)
#     user = request.user

#     # Assuming you have a Booking model to handle bookings
#     booking = Booking.objects.create(user=user, event=event)

#     return Response({'message': 'Event booked successfully', 'booking_id': booking.id}, status=status.HTTP_201_CREATED)
