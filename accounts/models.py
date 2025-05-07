from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission , BaseUserManager

ADMIN_USER_ROLE = 'Admin'
DEFAULT_USER_ROLE = 'User'

class userManager(BaseUserManager):
    def create_user(self,password, **extra_data):
        user = self.model(**extra_data)
        user.set_password(password)
        user.save()
        return user
        
    def create_superuser(self, password=None, **extra_data):
        extra_data.setdefault('is_staff', True)
        extra_data.setdefault('is_superuser', True)
        extra_data.setdefault('role', ADMIN_USER_ROLE)
        return self.create_user(password=password, **extra_data)
    
    
class User(AbstractUser) :
    USER_ROLES = (
        (DEFAULT_USER_ROLE, DEFAULT_USER_ROLE),
        (ADMIN_USER_ROLE, ADMIN_USER_ROLE),
    )
    
    role = models.CharField(max_length=20, choices=USER_ROLES, default=DEFAULT_USER_ROLE)
    
    groups = models.ManyToManyField(Group, related_name='User_Group', blank=True)
    user_permissions = models.ManyToManyField(
        Permission, related_name='User_Permissions', blank=True
    )
    
    objects = userManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    def __str__(self) :
        return self.username
    