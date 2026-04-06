from rest_framework import viewsets, permissions, filters, status
from rest_framework.views import APIView # <--- Nueva importación
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Producto, ProductoImagen
from .serializers import ProductoSerializer
from django.utils import timezone

# IMPORTANTE: Importar modelos y serializers de la app 'users'
from users.models import DetallePedido
from users.serializers import VentasParaProveedorSerializer


# --- 1. VISTA PARA EL VENDEDOR (GESTIÓN PRIVADA) ---
class ProductoViewSet(viewsets.ModelViewSet):
    """
    Panel de administración para el vendedor. 
    Permite CRUD completo y gestión de galería.
    """
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El vendedor solo ve sus propios productos
        return Producto.objects.filter(vendedor=self.request.user)

    def perform_create(self, serializer):
        # Asigna automáticamente al usuario logueado
        serializer.save(vendedor=self.request.user)

    # --- ACCIONES DE GALERÍA ---

    @action(detail=True, methods=['patch'])
    def set_portada(self, request, pk=None):
        """
        Establece una imagen específica como la principal del producto.
        URL: PATCH /api/vendedor/productos/{id}/set_portada/
        """
        producto = self.get_object()
        imagen_id = request.data.get('imagen_id')
        
        try:
            # 1. Quitamos la portada a todas las imágenes de este producto
            producto.imagenes.all().update(es_principal=False)
            
            # 2. Ponemos la nueva portada (validando que pertenezca al producto)
            imagen = ProductoImagen.objects.get(id=imagen_id, producto=producto)
            imagen.es_principal = True
            imagen.save()
            
            serializer = self.get_serializer(producto)
            return Response(serializer.data)
        except ProductoImagen.DoesNotExist:
            return Response({'error': 'La imagen no existe o no pertenece a este producto'}, 
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='eliminar-imagen/(?P<img_id>[0-9]+)')
    def eliminar_imagen(self, request, img_id=None):
        """
        Elimina una imagen específica de la galería.
        URL: DELETE /api/vendedor/productos/eliminar-imagen/{img_id}/
        """
        try:
            # Validamos que la imagen exista y pertenezca a un producto del vendedor actual
            imagen = ProductoImagen.objects.get(id=img_id, producto__vendedor=request.user)
            imagen.delete()
            return Response({'status': 'imagen eliminada'}, status=status.HTTP_200_OK)
        except ProductoImagen.DoesNotExist:
            return Response({'error': 'Imagen no encontrada o no tienes permiso'}, 
                            status=status.HTTP_404_NOT_FOUND)
        
        
    # PROMOCIONES 
    @action(detail=True, methods=['post'])
    def establecer_promocion(self, request, pk=None):
        producto = self.get_object()
        
        # 1. Extraemos los datos
        en_oferta = request.data.get('en_oferta', False)
        # Aseguramos que el porcentaje sea un número antes de calcular
        try:
            porcentaje = int(request.data.get('porcentaje_descuento', 0))
        except (ValueError, TypeError):
            porcentaje = 0
        
        if en_oferta and porcentaje > 0:
            # 2. Lógica de Activación
            descuento = (producto.precio * porcentaje) / 100
            producto.precio_oferta = producto.precio - descuento
            producto.en_oferta = True
            producto.porcentaje_descuento = porcentaje
            
            # 3. Manejo de Fecha (Movido antes del save y el return)
            fecha_input = request.data.get('fecha_fin_oferta')
            if not fecha_input:
                # Si no hay fecha, damos 7 días por defecto
                producto.fecha_fin_oferta = timezone.now() + timezone.timedelta(days=7)
            else:
                producto.fecha_fin_oferta = fecha_input
        else:
            # 4. Lógica de Desactivación (Limpieza total)
            producto.en_oferta = False
            producto.precio_oferta = None
            producto.porcentaje_descuento = 0
            producto.fecha_fin_oferta = None
            
        # 5. Guardar y Responder
        producto.save()
        serializer = self.get_serializer(producto)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

# --- 2. VISTA PARA LA TIENDA (CATÁLOGO PÚBLICO) ---
class StoreListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Catálogo global de Roarmot.
    """
    queryset = Producto.objects.filter(cantidad__gt=0).order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    permission_classes = [permissions.AllowAny] 
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'marca', 'sku', 'descripcion']

# --- 3. NUEVA VISTA: GESTIÓN DE VENTAS PARA EL PROVEEDOR ---
class VentasProveedorView(APIView):
    """
    Permite al proveedor ver quién compró sus productos (Camilo, etc.)
    mostrando dirección y teléfono para logística.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Filtramos detalles de pedido donde el vendedor del producto sea el usuario actual
        ventas = DetallePedido.objects.filter(
            producto__vendedor=request.user
        ).select_related('pedido__usuario', 'producto').order_by('-pedido__fecha_compra')

        serializer = VentasParaProveedorSerializer(ventas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)