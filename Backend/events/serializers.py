from rest_framework import serializers
from .models import Event, Tags
from tickets.models import Ticket
from django.utils import timezone

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']
        
        
class EventSerializer(serializers.ModelSerializer):
    tags = TagsSerializer(many=True, required=False)
    booked = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    image_upload = serializers.ImageField(write_only=True, required=False)
    available = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'price', 'venue', 'image',
                  'image_upload', 'category', 'tags', 'booked', 'available',
                  'start_date', 'deadline', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def get_image(self, obj):
        if obj.image :
            return obj.image.url
        return None
        
    def get_booked(self, obj):
        return Ticket.objects.filter(user=self.context['request'].user, event=obj).exists()
    
    def get_available(self, obj):
        return obj.deadline > timezone.now() and obj.start_date > timezone.now()
        
    def create(self, validated_data):
        image_upload = validated_data.pop('image_upload', None)
        if image_upload:
            validated_data['image'] = image_upload
        
        
        tags_data = validated_data.pop('tags', [])
        event = Event.objects.create(**validated_data)
        
        for tag_data in tags_data:
            tag,_ = Tags.objects.get_or_create(**tag_data)
            event.tags.add(tag)
        
        return event