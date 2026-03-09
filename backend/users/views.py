from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .serializers import UsuarioSerializer
from rest_framework_simplejwt.tokens import RefreshToken # <-- Importante

# --- VISTA PARA REGISTRO (Basada en Clase) ---
class RegistroUsuarioView(APIView):
    def post(self, request):
        # 1. Recibimos los datos que vienen desde el formulario de Angular
        serializer = UsuarioSerializer(data=request.data)
        
        # 2. Validamos que los datos sean correctos
        if serializer.is_valid():
            serializer.save()  # Guarda en la tabla 'usuario' de MySQL
            return Response(
                {"mensaje": "Usuario creado con éxito"}, 
                status=status.HTTP_201_CREATED
            )
        
        # 3. Si hay errores (ej. el correo ya existe), devolvemos el error
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- VISTA PARA LOGIN (Basada en Función) ---
# Debe estar fuera de la clase anterior para que el decorador funcione
@api_view(['POST'])
def login_usuario(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)
    
    if user is not None:
        # 1. Generamos los tokens para el usuario
        refresh = RefreshToken.for_user(user)
        
        # 2. Serializamos los datos (que ya configuramos antes)
        serializer = UsuarioSerializer(user)
        
        return Response({
            "mensaje": "Login exitoso",
            "token": str(refresh.access_token), # <-- LA LLAVE MAESTRA
            "usuario": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)