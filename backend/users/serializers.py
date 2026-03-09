from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='NOMBRE_USUARIO')
    apellido = serializers.CharField(source='APELLIDO_USUARIO')
    email = serializers.EmailField(source='CORREO_USUARIO')
    # Definimos telefono solo para recibirlo en el registro, pero no lo enviamos de vuelta
    telefono = serializers.CharField(source='TEL_USUARIO', write_only=True)
    password = serializers.CharField(write_only=True, source='CONTRASENA')
    nombre_empresa = serializers.CharField(source='NOMBRE_EMPRESA', required=False, allow_blank=True)
    
    rol = serializers.CharField(write_only=True)
    rol_id = serializers.IntegerField(source='ROL_ID_ROL', read_only=True) 

    class Meta:
        model = Usuario
        # El campo 'telefono' NO está aquí, por lo tanto no se envía al frontend
        fields = ['nombre', 'apellido', 'email', 'password', 'rol', 'rol_id', 'nombre_empresa', 'telefono']

    def create(self, validated_data):
        raw_password = validated_data.pop('CONTRASENA')
        rol_texto = validated_data.pop('rol').lower().strip()

        if rol_texto in ['proveedor', 'vendedor']:
            id_rol = 1
        else:
            id_rol = 2

        user = Usuario(**validated_data)
        user.is_active = True 
        user.ROL_ID_ROL = id_rol
        user.set_password(raw_password)
        user.save()
        
        return user