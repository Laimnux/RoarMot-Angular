from rest_framework import viewsets, permissions, filters
from .models import Producto
from .serializers import ProductoSerializer

# --- 1. VISTA PARA EL VENDEDOR (GESTIÓN PRIVADA) ---
class ProductoViewSet(viewsets.ModelViewSet):
    """
    Panel de administración para el vendedor. 
    Permite CRUD completo (Crear, Leer, Actualizar, Borrar).
    """
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtro para que el vendedor solo gestione sus propios productos
        return Producto.objects.filter(vendedor=self.request.user)

    def perform_create(self, serializer):
        # Asigna automáticamente al usuario logueado como el vendedor del producto
        serializer.save(vendedor=self.request.user)


# --- 2. VISTA PARA LA TIENDA (CATÁLOGO PÚBLICO) ---
class StoreListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Catálogo global de Roarmot.
    Cualquier usuario puede ver todos los productos con stock.
    """
    # Solo mostramos productos con stock (cantidad mayor a 0)
    queryset = Producto.objects.filter(cantidad__gt=0).order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    
    # AllowAny permite que usuarios no logueados vean la tienda
    permission_classes = [permissions.AllowAny] 
    
    # Configuración del buscador para Angular
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'marca', 'sku', 'descripcion']