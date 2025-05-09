from django.db import models

class Ticket(models.Model) :
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) :
        return f'Ticket for {self.event.title} by {self.user.username}'