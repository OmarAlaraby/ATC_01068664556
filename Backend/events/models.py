from django.db import models
from cloudinary.models import CloudinaryField

class Tags(models.Model) :
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Event(models.Model) :
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.FloatField()
    venue = models.CharField(max_length=50)
    image = CloudinaryField('image', folder='Areeb')
    category = models.CharField(max_length=50)
    tags = models.ManyToManyField(Tags, related_name='events')
    start_date = models.DateTimeField()
    deadline = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title