# motos/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Moto
from mantenimientos.models import GestorAlerta 

@receiver(post_save, sender=Moto)
def sincronizar_alertas_documentos(sender, instance, created, **kwargs):
    hoy = timezone.now().date()
    
    # Definimos los documentos a rastrear
    documentos = [
        {'titulo': "SOAT Próximo a vencer", 'fecha': instance.soat_moto},
        {'titulo': "Tecnomecánica Próxima", 'fecha': instance.tecnomecanica}
    ]

    for doc in documentos:
        if doc['fecha']:
            # Calculamos la prioridad aquí mismo para que el Dashboard sepa el color
            dias = (doc['fecha'] - hoy).days
            prioridad = 'critico' if dias <= 7 else 'advertencia'
            if dias > 30: prioridad = 'normal'

            # update_or_create asegura que no se dupliquen y que SIEMPRE lleve la fecha
            GestorAlerta.objects.update_or_create(
                moto=instance,
                titulo=doc['titulo'],
                defaults={
                    'fecha_vencimiento': doc['fecha'], # VITAL para Angular
                    'descripcion': f"Vencimiento registrado para la placa {instance.placa_moto}",
                    'nivel_prioridad': prioridad
                }
            )