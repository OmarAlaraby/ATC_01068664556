from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse

from .models import Event
from accounts.models import User

class EventTesting(TestCase) :
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
        
    def test_list_events_success(self):
        url = reverse('events-list')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
    def test_list_events_failure(self):
        # unauthenticated users can't view the events
        
        url = reverse('events-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)
        
    def test_create_event_success(self):
        url = reverse('events-list')
        self.client.force_authenticate(user=self.admin)
        
        data = {
            'title': 'New Event',
            'description': 'This is a new event',
            'price': 150.00,
            'venue': 'New Venue',
            'category': 'New Category',
            'start_date': '2023-10-02T10:00:00Z',
            'deadline': '2023-10-02T12:00:00Z',
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        
    def test_create_event_failure(self):
        # noremal users can't create events
        
        url = reverse('events-list')
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'New Event',
            'description': 'This is a new event',
            'price': 150.00,
            'venue': 'New Venue',
            'category': 'New Category',
            'start_date': '2023-10-02T10:00:00Z',
            'deadline': '2023-10-02T12:00:00Z',
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 403)
        
    def test_update_event_success(self):
        url = reverse('events-detail', args=[self.event.id])
        self.client.force_authenticate(user=self.admin)
        
        data = {
            'title': 'Updated Event',
            'description': 'This is an updated event',
            'price': 200.00,
            'venue': 'Updated Venue',
            'category': 'Updated Category',
            'start_date': '2023-10-03T10:00:00Z',
            'deadline': '2023-10-03T12:00:00Z',
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        
    def test_update_event_failure(self):
        url = reverse('events-detail', args=[self.event.id])
        self.client.force_authenticate(user=self.user)
        
        data = {
            'title': 'Updated Event',
            'description': 'This is an updated event',
            'price': 200.00,
            'venue': 'Updated Venue',
            'category': 'Updated Category',
            'start_date': '2023-10-03T10:00:00Z',
            'deadline': '2023-10-03T12:00:00Z',
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, 403)
        
    def test_delete_event_success(self):
        url = reverse('events-detail', args=[self.event.id])
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        
    def test_delete_event_failure(self):
        url = reverse('events-detail', args=[self.event.id])
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)