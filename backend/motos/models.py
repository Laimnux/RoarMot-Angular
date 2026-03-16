from django.db import models
from users.models import Usuario 

class Moto(models.Model):
    # --- IDENTIFICACIÓN Y ESTÉTICA ---
    id_datosmoto = models.AutoField(primary_key=True, db_column='ID_DATOSMOTO')
    marca_moto = models.CharField(max_length=25, db_column='MARCA_MOTO')
    modelo_moto = models.CharField(max_length=50, db_column='MODELO_MOTO')
    color_moto = models.CharField(max_length=30, db_column='COLOR_MOTO')
    placa_moto = models.CharField(max_length=45, db_column='PLACA_MOTO')
    imagen_moto = models.ImageField(upload_to='motos/', null=True, blank=True, db_column='IMAGEN_MOTO')
    
    # --- DOCUMENTACIÓN LEGAL ---
    soat_moto = models.DateField(db_column='SOAT_MOTO')
    tecnomecanica = models.DateField(db_column='TECNOMECANICA')
    
    # --- ESTADO DE KILOMETRAJE ---
    kilometraje = models.IntegerField(db_column='KILOMETRAJE')
    km_ultimo_mantenimiento = models.IntegerField(db_column='KM_ULTIMO_MANT', default=0)
    
    # --- ESPECIFICACIONES TÉCNICAS (PRECISIÓN) ---
    cilindraje = models.IntegerField(db_column='CILINDRAJE', default=150)
    fecha_ultimo_mantenimiento = models.DateField(db_column='FECHA_ULTIMO_MANT', null=True, blank=True)

    # Perfil de Desgaste
    TIPO_USO_CHOICES = [
        ('URBANO', 'Urbano (Trabajo/Ciudad)'),
        ('MIXTO', 'Mixto (Ciudad y Carretera)'),
        ('TURISMO', 'Turismo (Viajes largos)'),
    ]
    tipo_uso = models.CharField(
        max_length=15, 
        choices=TIPO_USO_CHOICES, 
        default='MIXTO',
        db_column='TIPO_USO'
    )

    # Durabilidad Química
    TIPO_ACEITE_CHOICES = [
        ('MINERAL', 'Mineral'),
        ('SEMISINTETICO', 'Semisintético'),
        ('SINTETICO', 'Sintético'),
    ]
    tipo_aceite = models.CharField(
        max_length=15, 
        choices=TIPO_ACEITE_CHOICES, 
        default='SEMISINTETICO',
        db_column='TIPO_ACEITE'
    )

    # --- RELACIONES ---
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usuario_ID_USUARIO')

    class Meta:
        db_table = 'datos_moto'

    def __str__(self):
        return f"{self.marca_moto} {self.modelo_moto} - {self.placa_moto} ({self.cilindraje}cc)"