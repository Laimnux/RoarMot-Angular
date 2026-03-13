from django.db import models

# 1. Catálogo de mantenimientos (Lo que se debe revisar)
class TipoMantenimiento(models.Model):
    id_tipo = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100) # Ej: "Cambio de Aceite", "SOAT", "Bujía"
    es_por_fecha = models.BooleanField(default=False) # True para documentos
    es_por_km = models.BooleanField(default=True)    # True para partes mecánicas
    intervalo_km = models.IntegerField(null=True, blank=True)
    intervalo_meses = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.nombre

# 2. Historial: Cuándo se hizo qué
class RegistroMantenimiento(models.Model):
    id_registro = models.AutoField(primary_key=True)
    # CORRECCIÓN: Apuntamos a 'motos.Moto' porque ese es el nombre de la CLASE en tu models.py
    moto = models.ForeignKey('motos.Moto', on_delete=models.CASCADE, related_name='mantenimientos')
    tipo = models.ForeignKey(TipoMantenimiento, on_delete=models.CASCADE)
    fecha_realizado = models.DateField()
    km_realizado = models.IntegerField()
    notas = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo.nombre}"

# 3. La tabla de alertas
class GestorAlerta(models.Model):
    id_alerta = models.AutoField(primary_key=True)
    # CORRECCIÓN: Apuntamos a 'motos.Moto'
    moto = models.ForeignKey('motos.Moto', on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=255)
    nivel_prioridad = models.CharField(max_length=20, default='normal')
    
    def __str__(self):
        return f"{self.titulo}"