from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UsuarioManager(BaseUserManager):
    def create_user(self, CORREO_USUARIO, password=None, **extra_fields):
        if not CORREO_USUARIO:
            raise ValueError('El usuario debe tener un correo electrónico')
        user = self.model(CORREO_USUARIO=self.normalize_email(CORREO_USUARIO), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, CORREO_USUARIO, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(CORREO_USUARIO, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):

    # Busca estas líneas y cámbialas por estas:
    is_active = models.BooleanField(default=True, db_column='IS_ACTIVE') 
    is_staff = models.BooleanField(default=False, db_column='IS_STAFF')

    ID_USUARIO = models.AutoField(primary_key=True)
    TIPO_DOCUMENTO = models.CharField(max_length=255, null=True, blank=True)
    NUMERO_USUARIO = models.CharField(max_length=255, null=True, blank=True)
    NOMBRE_USUARIO = models.CharField(max_length=255, null=True, blank=True)
    APELLIDO_USUARIO = models.CharField(max_length=255, null=True, blank=True)
    TEL_USUARIO = models.CharField(max_length=255, null=True, blank=True)
    CORREO_USUARIO = models.EmailField(max_length=255, unique=True)
    
    # AJUSTE AQUÍ: db_column asegura que Django use tu columna de XAMPP
    CONTRASENA = models.CharField(max_length=128, db_column='CONTRASENA') 
    last_login = models.DateTimeField(db_column='LAST_LOGIN', null=True, blank=True)
    is_superuser = models.BooleanField(db_column='IS_SUPERUSER', default=False)
    
    ESTADO_USUARIO = models.CharField(max_length=255, default='Activo')
    FECHA_CREACION = models.DateTimeField(auto_now_add=True)
    NOMBRE_EMPRESA = models.CharField(max_length=255, null=True, blank=True)
    ROL_ID_ROL = models.IntegerField(db_column='ROL_ID_ROL', default=2) 
    # En el modelo Usuario, podrías cambiarlo a esto si quieres que Django gestione el archivo:
    URL_IMAGEN_PERFIL = models.ImageField(upload_to='usuarios/avatars/', null=True, blank=True)
    URL_IMAGEN_MOTO = models.CharField(max_length=255, null=True, blank=True)

    # --- NUEVOS CAMPOS PARA LOGÍSTICA Y COMPRAS ---
    DIRECCION_ENTREGA = models.CharField(max_length=500, null=True, blank=True, db_column='DIRECCION_ENTREGA')
    CIUDAD = models.CharField(max_length=255, null=True, blank=True, db_column='CIUDAD')
    DEPARTAMENTO = models.CharField(max_length=255, null=True, blank=True, db_column='DEPARTAMENTO')
    CODIGO_POSTAL = models.CharField(max_length=20, null=True, blank=True, db_column='CODIGO_POSTAL')
    NOTAS_ENVIO = models.TextField(null=True, blank=True, db_column='NOTAS_ENVIO')

    # IMPORTANTE: Django necesita saber si el usuario está activo para dejarlo entrar
    def has_perm(self, perm, obj=None): return True
    def has_module_perms(self, app_label): return True

    # --- EL TRUCO PARA EL ERROR 1054 ---
    @property
    def password(self):
        return self.CONTRASENA

    @password.setter
    def password(self, raw_password):
        # Cuando Django haga set_password(), el resultado caerá en CONTRASENA
        self.CONTRASENA = raw_password

    objects = UsuarioManager()

    USERNAME_FIELD = 'CORREO_USUARIO'
    REQUIRED_FIELDS = ['NOMBRE_USUARIO', 'APELLIDO_USUARIO']

    class Meta:
        db_table = 'usuario'
        managed = True # Cambia a False si NO quieres que Django haga migraciones sobre esta tabla

    def __str__(self):
        return self.CORREO_USUARIO
    

class Pedido(models.Model):
    ESTADOS_PAGO = (
        ('PENDIENTE', 'Pendiente'),
        ('APROBADO', 'Aprobado'),
        ('RECHAZADO', 'Rechazado'),
    )

    id_pedido = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mis_pedidos', db_column='usuario_id')
    fecha_compra = models.DateTimeField(auto_now_add=True)
    total_pago = models.DecimalField(max_digits=12, decimal_places=2)
    estado_pago = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='PENDIENTE')
    id_transaccion_pasarela = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'pedido'

    def __str__(self):
        return f"Pedido {self.id_pedido} - {self.usuario.CORREO_USUARIO}"

class DetallePedido(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')

    # Importante: Relacionamos con tu modelo de Producto (ajusta el nombre si es distinto)
    producto = models.ForeignKey(
        'vendedor.Producto', 
        on_delete=models.PROTECT, 
        related_name='ventas_realizadas'
        ) # Usamos ID simple por ahora para evitar conflictos de importación
    nombre_producto = models.CharField(max_length=255) # Guardamos el nombre por si el producto se borra luego
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'detalle_pedido'