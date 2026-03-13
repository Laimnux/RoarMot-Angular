from rest_framework import serializers
from .models import GestorAlerta, TipoMantenimiento, RegistroMantenimiento

class GestorAlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GestorAlerta
        fields = '__all__'
# ... puedes agregar los demás después