from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Ticket
from .serializer import TicketSerializer
from .permission import TicketPermission
from events.models import Event

from project.viewsets import AreebViewSet

# utils
from django.shortcuts import get_object_or_404
from django.db import transaction

class TicketListView(AreebViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [TicketPermission]
    http_method_names = ['get', 'delete']
    

@transaction.atomic
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_ticket(request, event_id):
    user = request.user
    event = get_object_or_404(Event, id=event_id)
    
    if Ticket.objects.filter(user=user, event=event).exists():
        return Response({
                'status': 'error',
                'message': 'Invalid request',
                'error': 'You have already booked a ticket for this event'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    Ticket.objects.create(user=user, event=event)
    return Response({
            'satus': 'success',
            'message': 'Ticket booked successfully',
        },
        status=status.HTTP_201_CREATED
    )