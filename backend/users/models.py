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
    URL_IMAGEN_PERFIL = models.CharField(max_length=255, null=True, blank=True)
    URL_IMAGEN_MOTO = models.CharField(max_length=255, null=True, blank=True)

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