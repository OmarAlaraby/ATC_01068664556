from rest_framework.test import APIClient
from django.test import TestCase


from .models import User
from rest_framework_simplejwt.tokens import RefreshToken

# utils
from django.urls import reverse

class AccountsTesting(TestCase) :
    def setUp(self):
        self.client = APIClient()
        
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@gmail.com',
            password='admin@123',
        )
        
        self.user = User.objects.create_user(
            username='user_1',
            email='user_1@gmail.com',
            password='user_1@123',
        )
        
    def test_user_signup_success(self) :
        url = reverse('signup_user')
        data = {
            'username': 'test_user',
            'email': 'test_user@gmail.com',
            'password': 'test_user@123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        
    def test_user_signup_failure(self) :
        url = reverse('signup_user')
        data = {
            'username': 'test_user',
            'password': 'test_user@123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 400)
        
    def test_user_signin_success(self) :
        url = reverse('sginin_user')
        data = {
            'email': 'user_1@gmail.com',
            'password': 'user_1@123'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        
    def test_user_signin_failure(self) :
        url = reverse('sginin_user')
        data = {
            'email': 'user_1@gmail.com',
            'password': 'wrong_password'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 401)
        
    def test_refresh_token_success(self) :
        refresh_token = RefreshToken.for_user(self.user)
        url = reverse('token_refresh')
        data = {
            'refresh': str(refresh_token)
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        
    def test_refresh_token_failure(self) :
        url = reverse('token_refresh')
        data = {
            'refresh': 'wrong_token'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 401)
        
    # NOTE : i should test the verify email function (reminder)
