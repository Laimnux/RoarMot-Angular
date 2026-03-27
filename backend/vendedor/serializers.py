from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    # Campo de solo lectura para la fecha formateada
    fecha_creacion = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # Campo dinámico para la URL completa de la imagen
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            'id', 
            'nombre', 
            'marca', 
            'sku', 
            'descripcion', 
            'precio', 
            'cantidad', 
            'stock_minimo', 
            'imagen',      # Mantenemos el original por si necesitas la ruta relativa
            'imagen_url',  # Este es el que usará Angular para el src de las <img>
            'talla', 
            'id_subcategoria', 
            'vendedor',
            'fecha_creacion'
        ]

    # --- LÓGICA DE IMAGEN ---
    def get_imagen_url(self, obj):
        """
        Construye la URL absoluta para que el Frontend pueda mostrar la foto.
        """
        if obj.imagen:
            # Importante: Asegúrate de que en settings.py tengas configurado MEDIA_URL
            return f"http://localhost:8000/media/{obj.imagen}"
        return None

    # --- VALIDACIONES (CRÍTICAS PARA EL CRUD DE VENDEDOR) ---
    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError("La cantidad no puede ser negativa.")
        return value