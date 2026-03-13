from django.apps import AppConfig

 # ¿Qué ganamos con esto?
#Ahora, cada vez que editemos una moto en tu Dashboard (o en el Admin.py de mantenimientos), 
# el sistema borrará las alertas viejas y calculará las nuevas al instante.

class MantenimientosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mantenimientos'

    def ready(self):
        import mantenimientos.signals # <-- Esto activa el archivo que acabamos de crear
