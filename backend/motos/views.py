from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Moto
from .serializers import MotoSerializer

class MotoViewSet(viewsets.ModelViewSet):
    queryset = Moto.objects.all()
    serializer_class = MotoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # 1. Filtro: Al listar (GET), el usuario solo ve sus propias motos
    def get_queryset(self):
        return Moto.objects.filter(usuario=self.request.user)

    # 2. Creación: Al guardar (POST), se asigna el usuario del token automáticamente
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)