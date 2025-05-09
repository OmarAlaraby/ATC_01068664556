from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

from events.models import Event
from accounts.models import User

class TicketBookingTesting(TestCase) :
    def setUp(self):
        self.client = APIClient()
        
        self.event = Event.objects.create(
            title='Test Event',
            description='This is a test event',
            price=100.00,
            venue='Test Venue',
            category='Test Category',
            start_date='2023-10-01T10:00:00Z',
            deadline='2023-10-01T12:00:00Z',
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@mgail.com',
            password='test@123',
        )
        
        self.admin = User.objects.create_superuser(
            username='adminuser',
            email='adminuser@gmail.com',
            password='admin@123',
        )
        
    def test_book_ticket_success(self):
        url = reverse('book_ticket', args=[self.event.id])
        refresh_token = RefreshToken.for_user(self.user)
        
        response = self.client.post(url, {
            'event': self.event.id,
        }, HTTP_AUTHORIZATION=f'Bearer {refresh_token.access_token}')
        
        self.assertEqual(response.status_code, 201)
        
    def test_book_ticket_already_booked(self):
        url = reverse('book_ticket', args=[self.event.id])
        refresh_token = RefreshToken.for_user(self.user)
        
        self.client.post(url, {
            'event': self.event.id,
        }, HTTP_AUTHORIZATION=f'Bearer {refresh_token.access_token}')
        
        response = self.client.post(url, {
            'event': self.event.id,
        }, HTTP_AUTHORIZATION=f'Bearer {refresh_token.access_token}')
        
        self.assertEqual(response.status_code, 400)
        
    def test_book_ticket_invalid_event(self):
        url = reverse('book_ticket', args=[1000000])
        refresh_token = RefreshToken.for_user(self.user)
        response = self.client.post(url, {
            'event': 999,
        }, HTTP_AUTHORIZATION=f'Bearer {refresh_token.access_token}')
        self.assertEqual(response.status_code, 404)
        
    def test_book_ticket_unauthenticated(self):
        url = reverse('book_ticket', args=[self.event.id])
        response = self.client.post(url, {
            'event': self.event.id,
        })
        self.assertEqual(response.status_code, 401)