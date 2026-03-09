from django.contrib import admin
from django.urls import path, include # Importante agregar 'include'
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Tu vista de prueba se queda igual
@api_view(['GET'])
def index_api(request):
    return Response({"mensaje": "¡Conexión exitosa desde Django!", "status": "OK"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/index/', index_api), 
    
    # ESTA ES LA LÍNEA QUE FALTA:
    path('api/users/', include('users.urls')), 
]