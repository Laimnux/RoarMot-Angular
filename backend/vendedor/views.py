from rest_framework import viewsets, permissions
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer
    # Solo usuarios autenticados pueden usar este panel
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # FILTRO CRÍTICO: El proveedor solo ve sus productos
        return Producto.objects.filter(vendedor=self.request.user)

    def perform_create(self, serializer):
        # ASIGNACIÓN AUTOMÁTICA: El vendedor actual es el dueño del producto
        serializer.save(vendedor=self.request.user)