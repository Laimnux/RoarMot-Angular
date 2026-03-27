from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertaViewSet

# Creamos un router interno para mantenimientos
router = DefaultRouter()
router.register(r'alertas', AlertaViewSet, basename='alertas')

urlpatterns = [
    # Esto creará la ruta: /api/mantenimientos/alertas/
    path('', include(router.urls)),
]