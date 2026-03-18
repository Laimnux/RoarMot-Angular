from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    # Campos que solo son de lectura (Django los genera automáticamente)
    fecha_creacion = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
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
            'imagen', 
            'talla', 
            'id_subcategoria', 
            'vendedor',
            'fecha_creacion'
        ]

    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError("La cantidad no puede ser negativa.")
        return value