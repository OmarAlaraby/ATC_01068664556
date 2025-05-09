from django.contrib import admin
from django.urls import path, include, re_path

# for the docs
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Areeb Project docs",
      default_version='v1',
      description="API documentation for Areeb Project (Events Booking)",
      contact=openapi.Contact(email="omar.alaraby23@gmail.com"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('events.urls')),
    re_path(r'^docs/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
