from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario, Pedido, DetallePedido
from .serializers import UsuarioSerializer, PedidoSerializer

# --- VISTA PARA REGISTRO ---
class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensaje": "Usuario creado con éxito"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- VERIFICACIÓN DE DISPONIBILIDAD ---
@api_view(['GET'])
@permission_classes([AllowAny])
def verificar_email(request, email):
    existe = Usuario.objects.filter(CORREO_USUARIO=email).exists()
    return Response({'disponible': not existe})

# --- VISTA PARA LOGIN ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_usuario(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(username=email, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        serializer = UsuarioSerializer(user)
        
        return Response({
            "mensaje": "Login exitoso",
            "token": str(refresh.access_token),
            "usuario": serializer.data
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

# --- VISTA DE PERFIL (Edición Inline y Fotos) ---
class PerfilUsuarioView(APIView):
    permission_classes = [IsAuthenticated]
    # Soportamos MultiPart (fotos) y JSON (edición inline de texto)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        """Obtener datos del piloto/proveedor actual"""
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Actualización parcial para edición campo por campo"""
        user = request.user
        # 'partial=True' permite enviar solo el campo que cambió (ej: solo la ciudad)
        serializer = UsuarioSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "mensaje": "Campo actualizado correctamente", 
                "usuario": serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- VISTA DE PEDIDOS Y VENTAS ---
class PedidoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user ya es el objeto Usuario que obtuvo el ID 44 (Camilo) o 47 (Antonio)
        usuario_actual = request.user 
        
        # Filtramos directamente por el campo ID_USUARIO de tu modelo
        # Esto asegura que Camilo solo vea lo que tiene grabado con su ID 44
        pedidos = Pedido.objects.filter(usuario=usuario_actual).order_by('-fecha_compra')
        
        # Si quieres que el Proveedor (Antonio) vea todo, puedes dejar el IF,
        # pero para que Camilo NO vea lo de otros, el filter DEBE ser por usuario_actual.
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            # Aquí es donde vinculamos el pedido al usuario logueado
            serializer.save(usuario=request.user)
            return Response({
                "mensaje": "ORDEN_RECIBIDA_EN_GARAJE", 
                "id_pedido": serializer.data['id_pedido']
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)