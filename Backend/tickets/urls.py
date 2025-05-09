from django.urls import path
from . import views

urlpatterns = [
    path('book/event/<int:event_id>/', views.book_ticket, name='book_ticket'),    
]