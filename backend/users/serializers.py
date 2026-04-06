from rest_framework import serializers
from .models import Usuario, Pedido, DetallePedido
from rest_framework.validators import UniqueValidator
# IMPORTANTE: Importa el modelo Producto de tu otra app
from vendedor.models import Producto

class UsuarioSerializer(serializers.ModelSerializer):
    # 1. MAPEAMOS EL ID PARA EL FRONTEND
    id = serializers.IntegerField(source='ID_USUARIO', read_only=True)
    nombre = serializers.CharField(source='NOMBRE_USUARIO', required=False)
    apellido = serializers.CharField(source='APELLIDO_USUARIO', required=False)
    
    # Validador de email único (se mantiene para el registro)
    email = serializers.EmailField(
        source='CORREO_USUARIO',
        required=False,
        validators=[UniqueValidator(queryset=Usuario.objects.all(), message="Este correo ya está registrado.")]
    )
    
    tipo_documento = serializers.CharField(source='TIPO_DOCUMENTO', required=False, allow_blank=True)
    numero_usuario = serializers.CharField(source='NUMERO_USUARIO', required=False, allow_blank=True)

    # Campos de contacto y seguridad
    telefono = serializers.CharField(source='TEL_USUARIO', required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, source='CONTRASENA', required=False)
    
    nombre_empresa = serializers.CharField(source='NOMBRE_EMPRESA', required=False, allow_blank=True)

    # --- CAMPOS DE LOGÍSTICA (Ajustados para Inline Editing) ---
    direccion = serializers.CharField(source='DIRECCION_ENTREGA', required=False, allow_blank=True)
    ciudad = serializers.CharField(source='CIUDAD', required=False, allow_blank=True)
    departamento = serializers.CharField(source='DEPARTAMENTO', required=False, allow_blank=True)
    codigo_postal = serializers.CharField(source='CODIGO_POSTAL', required=False, allow_blank=True)
    notas = serializers.CharField(source='NOTAS_ENVIO', required=False, allow_blank=True)

    # Imagen de Perfil
    url_imagen_perfil = serializers.ImageField(
        source='URL_IMAGEN_PERFIL',
        required=False,
        allow_null=True
    )

    # Roles
    rol = serializers.CharField(write_only=True, required=False) 
    rol_id = serializers.IntegerField(source='ROL_ID_ROL', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'apellido', 'email', 'password', 'rol', 
            'rol_id', 'nombre_empresa', 'telefono', 'direccion', 
            'ciudad', 'departamento', 'codigo_postal', 'notas',
            'url_imagen_perfil', 'tipo_documento', 'numero_usuario'
        ]

    def create(self, validated_data):
        """Lógica para el registro de nuevos usuarios"""
        raw_password = validated_data.pop('CONTRASENA')
        rol_texto = validated_data.pop('rol', 'motero').lower().strip()

        # Lógica de Roles: 1 para Proveedores, 2 para Moteros
        if rol_texto in ['proveedor', 'vendedor', 'partner']:
            id_rol = 1
        else:
            id_rol = 2

        user = Usuario(**validated_data)
        user.is_active = True 
        user.ROL_ID_ROL = id_rol
        user.set_password(raw_password)
        user.save()
        return user

    def update(self, instance, validated_data):
        """Lógica para edición Inline y actualización de perfil"""
        # Si se envía una nueva contraseña (CONTRASENA mapeada desde password)
        password = validated_data.pop('CONTRASENA', None)
        if password:
            instance.set_password(password)
        
        # El resto de campos se actualizan automáticamente mediante partial=True en la View
        return super().update(instance, validated_data)

# --- SERIALIZERS DE PEDIDOS (Se mantienen igual) ---

class DetallePedidoSerializer(serializers.ModelSerializer):
    # Usamos el ID del producto para que el Front lo envíe fácil
    # Pero lo mapeamos al campo 'producto' del modelo 'vendedor'
    producto_id = serializers.PrimaryKeyRelatedField(
        source='producto', 
        queryset=Producto.objects.all()
    )

    class Meta:
        model = DetallePedido
        fields = [
            'id_detalle', 
            'producto_id', # Lo que viene de Angular
            'nombre_producto', 
            'cantidad', 
            'precio_unitario'
        ]

class VentasParaProveedorSerializer(serializers.ModelSerializer):
    # Extraemos datos del cliente desde la relación Pedido -> Usuario
    cliente_nombre = serializers.CharField(source='pedido.usuario.NOMBRE_USUARIO', read_only=True)
    cliente_apellido = serializers.CharField(source='pedido.usuario.APELLIDO_USUARIO', read_only=True)
    cliente_tel = serializers.CharField(source='pedido.usuario.TEL_USUARIO', read_only=True)
    cliente_direccion = serializers.CharField(source='pedido.usuario.DIRECCION_ENTREGA', read_only=True)
    cliente_ciudad = serializers.CharField(source='pedido.usuario.CIUDAD', read_only=True)
    fecha = serializers.DateTimeField(source='pedido.fecha_compra', read_only=True)
    estado = serializers.CharField(source='pedido.estado_pago', read_only=True)

    class Meta:
        model = DetallePedido
        fields = [
            'id_detalle', 'nombre_producto', 'cantidad', 'precio_unitario',
            'cliente_nombre', 'cliente_apellido', 'cliente_tel', 
            'cliente_direccion', 'cliente_ciudad', 'fecha', 'estado'
        ]

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    # Mapeamos campos para que coincidan con Html Angular
    id_pedido = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Pedido
        fields = [
            'id_pedido', 'usuario', 'fecha_compra', 
            'total_pago', 'estado_pago', 'detalles'
        ]
        # El usuario SIEMPRE es de lectura, lo sacamos del Token en la vista
        read_only_fields = ['usuario', 'fecha_compra'] # El usuario lo sacamos del token

    def create(self, validated_data):
        # 1. Extraemos los detalles del JSON
        detalles_data = validated_data.pop('detalles')
        
        # 2. Creamos la cabecera del Pedido
        pedido = Pedido.objects.create(**validated_data)
        
        # 3. Creamos cada detalle vinculado a este pedido
        for detalle in detalles_data:
            DetallePedido.objects.create(pedido=pedido, **detalle)
            
        return pedido