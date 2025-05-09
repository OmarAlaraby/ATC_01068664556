from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import ADMIN_USER_ROLE

class TicketPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == ADMIN_USER_ROLE
    
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == ADMIN_USER_ROLE