from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.Serializer):
    class Meta :
        model = Ticket
        fields = ['id', 'user', 'event', 'created_at']
        read_only_fields = ['id', 'created_at']