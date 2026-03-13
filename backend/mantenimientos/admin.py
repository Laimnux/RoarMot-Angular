from django.contrib import admin
from .models import TipoMantenimiento, RegistroMantenimiento, GestorAlerta

admin.site.register(TipoMantenimiento)
admin.site.register(RegistroMantenimiento)
admin.site.register(GestorAlerta)