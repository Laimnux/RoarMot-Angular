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
    sku = models.CharField(max_length=20, unique=True, help_text="Referencia única de inventario")
    descripcion = models.TextField()
    
    # Logística e Inventario
    precio = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    cantidad = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=3, help_text="Alerta cuando el stock sea menor a este número")
    
    # Vitrina
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
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

    def __str__(self):
        return f"{self.nombre} ({self.marca}) - SKU: {self.sku}"