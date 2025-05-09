from rest_framework import serializers
from .models import Event, Tags

class TagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tags
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']
        
        
class EventSerializer(serializers.ModelSerializer):
    tags = TagsSerializer(many=True, required=False)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'price',
                  'venue', 'image', 'category', 'tags',
                  'start_date', 'deadline', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        event = Event.objects.create(**validated_data)
        
        for tag_data in tags_data:
            tag,_ = Tags.objects.get_or_create(**tag_data)
            event.tags.add(tag)
        
        return event