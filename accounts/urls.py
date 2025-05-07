from django.urls import path
from . import views


urlpatterns = [
    path('user/signup/', views.signUp, name='signup_user'),
    path('user/signin/', views.TokenObtainPairView__.as_view(), name='sginin_user'),
    path('token/refresh/', views.TokenRefreshView__.as_view(), name='token_refresh'),
]