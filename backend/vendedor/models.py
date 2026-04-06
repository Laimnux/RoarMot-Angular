from django.db import models
from django.conf import settings # Importante para referenciar el modelo personalizado

class Producto(models.Model):
    TALLAS_CHOICES = [
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
        ('NA', 'No Aplica / Accesorios'),
    ]

    # Identidad del Producto
    nombre = models.CharField(max_length=100)
    marca = models.CharField(max_length=50)
    sku = models.CharField(
        max_length=20, 
        help_text="Referencia única de inventario")
    
    descripcion = models.TextField()
    
    # Logística e Inventario
    precio = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    cantidad = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=3, help_text="Alerta cuando el stock sea menor a este número")
    
    # Vitrina
    talla = models.CharField(max_length=5, choices=TALLAS_CHOICES, default='NA')
    
    # Categorización
    id_subcategoria = models.IntegerField(default=1) 
    
    # RELACIÓN CORREGIDA:
    # Usamos settings.AUTH_USER_MODEL para que Django use tu clase 'Usuario'
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mis_productos',
        db_column='ID_USUARIO' # Forzamos a que en la BD se relacione con tu columna ID_USUARIO
    )

    # Auditoría
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-fecha_creacion']

        unique_together = ('sku', 'vendedor')

    def __str__(self):
        return f"{self.nombre} ({self.marca}) - SKU: {self.sku}"
    
    # --- SISTEMA DE PROMOCIONES ---
    en_oferta = models.BooleanField(default=False, help_text="Activa el modo promoción")
    precio_oferta = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    porcentaje_descuento = models.PositiveIntegerField(default=0, help_text="Ej: 20 para un 20% de dto")
    fecha_fin_oferta = models.DateTimeField(null=True, blank=True, help_text="Cuándo termina la promoción")
    


# NUEVO MODELO PARA LA GALERÍA
class ProductoImagen(models.Model):
    producto = models.ForeignKey(
        Producto, 
        related_name='imagenes', 
        on_delete=models.CASCADE
    )
    imagen = models.ImageField(upload_to='productos/galeria/')
    # --- Nuevo campo para la portada usuario selecciona portada ---
    es_principal = models.BooleanField(
        default=False,
        help_text="Indica si esta imagen es la portada del producto"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ordenamos para que la principal siempre aprezca primero en las consulta
        ordering = ['-es_principal', '-fecha_creacion']

    def __str__(self):
        return f"Imagen de {self.producto.nombre} {'(PORTADA)' if self.es_principal else ''}"
    
