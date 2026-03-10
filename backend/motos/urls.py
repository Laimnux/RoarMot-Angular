from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MotoViewSet

router = DefaultRouter()
router.register(r'', MotoViewSet) # Esto crea rutas para GET, POST, PUT, DELETE automáticamente

urlpatterns = [
    path('', include(router.urls)),
]