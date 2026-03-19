from rest_framework import serializers
from .models import Usuario
from rest_framework.validators import UniqueValidator

class UsuarioSerializer(serializers.ModelSerializer):
    # 1. MAPEAMOS EL ID PARA EL FRONTEND
    # 'id' es lo que verá Angular, 'ID_USUARIO' es como se llama en tu DB
    id = serializers.IntegerField(source='ID_USUARIO', read_only=True)

    nombre = serializers.CharField(source='NOMBRE_USUARIO')
    apellido = serializers.CharField(source='APELLIDO_USUARIO')
    
    # Validador de email único con el nombre de columna correcto
    email = serializers.EmailField(
        source='CORREO_USUARIO',
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message="Este correo ya está registrado.")]
    )
    
    # Campos que solo se reciben pero no se envían de vuelta por seguridad
    telefono = serializers.CharField(source='TEL_USUARIO', write_only=True)
    password = serializers.CharField(write_only=True, source='CONTRASENA')
    
    nombre_empresa = serializers.CharField(source='NOMBRE_EMPRESA', required=False, allow_blank=True)
    
    # Roles
    rol = serializers.CharField(write_only=True) # Se recibe 'proveedor' o 'motero'
    rol_id = serializers.IntegerField(source='ROL_ID_ROL', read_only=True) # Se devuelve 1 o 2

    class Meta:
        model = Usuario
        # AGREGAMOS 'id' a la lista de salida
        fields = ['id', 'nombre', 'apellido', 'email', 'password', 'rol', 'rol_id', 'nombre_empresa', 'telefono']

    def create(self, validated_data):
        # Extraemos los datos que no van directo al modelo
        raw_password = validated_data.pop('CONTRASENA')
        rol_texto = validated_data.pop('rol').lower().strip()

        # Lógica de Roles: 1 para Proveedores, 2 para Moteros
        if rol_texto in ['proveedor', 'vendedor', 'partner']:
            id_rol = 1
        else:
            id_rol = 2

        # Creamos la instancia del usuario
        user = Usuario(**validated_data)
        user.is_active = True 
        user.ROL_ID_ROL = id_rol
        user.set_password(raw_password) # Encriptación de Django
        user.save()
        
        return user