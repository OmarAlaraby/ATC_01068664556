from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .serializers import EventSerializer
from .models import Event
from .permissions import EventPermission
from project.pagination import AreebPagination


# utils
from django.shortcuts import get_object_or_404
from project.viewsets import AreebViewSet


class EventViewSet(AreebViewSet) :
    permission_classes = [EventPermission]
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    pagination_class = AreebPagination
    
    def create(self, request, *args, **kwargs):
        print(request.data)
        return super().create(request, *args, **kwargs)
    

# @api_view(['POST'])
# def book_event(request, event_id):
#     event = get_object_or_404(Event, id=event_id)
#     user = request.user

#     # Assuming you have a Booking model to handle bookings
#     booking = Booking.objects.create(user=user, event=event)

#     return Response({'message': 'Event booked successfully', 'booking_id': booking.id}, status=status.HTTP_201_CREATED)
