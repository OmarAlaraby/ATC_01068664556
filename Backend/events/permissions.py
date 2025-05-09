from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import ADMIN_USER_ROLE

class EventPermission(BasePermission):
    """
        if the use is Admin, so he can do all CRUD operations
        otherwise, he can only GET the events
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return request.user and request.user.is_authenticated and request.user.role == ADMIN_USER_ROLE
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return request.user and request.user.is_authenticated and request.user.role == ADMIN_USER_ROLE