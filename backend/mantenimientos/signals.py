from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from motos.models import Moto
from .models import GestorAlerta

@receiver(post_save, sender=Moto)
def verificar_alertas_moto(sender, instance, **kwargs):
    # 1. Limpiamos alertas viejas para esta moto para no duplicar
    GestorAlerta.objects.filter(moto=instance).delete()

    hoy = timezone.now().date()
    
    # --- LÓGICA PARA EL SOAT ---
    if instance.soat_moto:
        dias_soat = (instance.soat_moto - hoy).days
        
        if dias_soat <= 30:
            prioridad = 'critico' if dias_soat <= 7 else 'advertencia'
            GestorAlerta.objects.create(
                moto=instance,
                titulo="SOAT Próximo a vencer",
                descripcion=f"Tu SOAT vence en {dias_soat} días ({instance.soat_moto})",
                nivel_prioridad=prioridad
            )

    # --- LÓGICA PARA LA TECNOMECÁNICA ---
    if instance.tecnomecanica:
        dias_tecno = (instance.tecnomecanica - hoy).days
        
        if dias_tecno <= 30:
            prioridad = 'critico' if dias_tecno <= 7 else 'advertencia'
            GestorAlerta.objects.create(
                moto=instance,
                titulo="Tecnomecánica Próxima",
                descripcion=f"La revisión vence en {dias_tecno} días",
                nivel_prioridad=prioridad
            )