from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, StoreListViewSet

# 1. Configuramos el Router específico para el módulo vendedor
# Usamos un nombre de variable claro para evitar conflictos
router_vendedor = DefaultRouter()

# 2. Registro de rutas especializadas
# Esta ruta mantiene el CRUD (Crear, Leer, Actualizar, Borrar) para el dueño del producto
# Acceso: http://127.0.0.1:8000/api/vendedor/productos/
router_vendedor.register(r'productos', ProductoViewSet, basename='productos')

# Esta ruta es nueva y permite el catálogo global (Solo lectura)
# Acceso: http://127.0.0.1:8000/api/vendedor/store/
router_vendedor.register(r'store', StoreListViewSet, basename='store-global')

# 3. Esquema de URLs de la aplicación
urlpatterns = [
    # Incluye todas las rutas generadas automáticamente por el router_vendedor
    path('', include(router_vendedor.urls)),
]