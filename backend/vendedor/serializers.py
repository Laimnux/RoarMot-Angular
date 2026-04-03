from rest_framework import serializers
from .models import Producto, ProductoImagen

class ProductoImagenSerializer(serializers.ModelSerializer):
    """
    Serializer para las imágenes individuales de la galería.
    """
    class Meta:
        model = ProductoImagen
        fields = ['id', 'imagen', 'es_principal']

class ProductoSerializer(serializers.ModelSerializer):
    # Campo de solo lectura para la fecha formateada
    fecha_creacion = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # RELACIÓN N:1 -> Mostramos la lista de imágenes asociadas
    # Usamos el related_name='imagenes' definido en el modelo
    imagenes = ProductoImagenSerializer(many=True, read_only=True)

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
            'talla', 
            'id_subcategoria', 
            'vendedor',
            'fecha_creacion',
            'imagenes' # Sustituimos 'imagen' por la lista de 'imagenes'
        ]

    # --- LÓGICA DE CREACIÓN MULTI-IMAGEN ---
    def create(self, validated_data):
        """
        Sobrescribimos el método de creación para procesar la lista de archivos.
        """
        # Extraemos las imágenes de la petición (FILES)
        # Angular las enviará todas bajo la llave 'imagenes'
        request = self.context.get('request')
        imagenes_data = request.FILES.getlist('imagenes')

        # Creamos el producto principal
        producto = Producto.objects.create(**validated_data)

        # Creamos cada registro de imagen vinculado a este producto
        for imagen in imagenes_data:
            ProductoImagen.objects.create(producto=producto, imagen=imagen)
        
        return producto
    
    def update(self, instance, validated_data):
        """
        Sobrescribimos update para permitir añadir imágenes sin borrar las actuales,
        o gestionar la galería.
        """
        request = self.context.get('request')
        # Capturamos nuevas imágenes si vienen en la petición
        nuevas_imagenes = request.FILES.getlist('imagenes')

        # 1. Actualizamos los campos básicos (nombre, precio, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 2. Si vienen imágenes nuevas, las añadimos a la galería existente
        for img in nuevas_imagenes:
            ProductoImagen.objects.create(producto=instance, imagen=img)

        return instance

    # --- VALIDACIONES ---
    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError("La cantidad no puede ser negativa.")
        return value