from rest_framework import serializers
from .models import Moto

class MotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moto
        fields = '__all__'
        # IMPORTANTE: Esto evita que Angular tenga que enviar el ID del usuario
        read_only_fields = ('usuario',)