from django.db import models
from users.models import Usuario # Importamos tu modelo de usuario para la relación

class Moto(models.Model):
    # Usamos db_column para que coincida exactamente con tu MySQL
    id_datosmoto = models.AutoField(primary_key=True, db_column='ID_DATOSMOTO')
    marca_moto = models.CharField(max_length=25, db_column='MARCA_MOTO')
    modelo_moto = models.CharField(max_length=50, db_column='MODELO_MOTO')
    color_moto = models.CharField(max_length=30, db_column='COLOR_MOTO')
    
    # upload_to='motos/' creará una carpeta donde se guardarán físicamente las fotos
    imagen_moto = models.ImageField(upload_to='motos/', null=True, blank=True, db_column='IMAGEN_MOTO')
    
    soat_moto = models.DateField(db_column='SOAT_MOTO')
    tecnomecanica = models.DateField(db_column='TECNOMECANICA')
    placa_moto = models.CharField(max_length=45, db_column='PLACA_MOTO')
    kilometraje = models.IntegerField(db_column='KILOMETRAJE')
    
    # La llave foránea hacia el usuario
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='usuario_ID_USUARIO')

    class Meta:
        db_table = 'datos_moto' # Nombre de la tabla física en MySQL

    def __str__(self):
        return f"{self.marca_moto} {self.modelo_moto} - {self.placa_moto}"