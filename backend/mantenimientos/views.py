from rest_framework import viewsets
from .models import GestorAlerta
from .serializers import GestorAlertaSerializer # Asegúrate de haber creado el serializer

class AlertaViewSet(viewsets.ModelViewSet):
    queryset = GestorAlerta.objects.all()
    serializer_class = GestorAlertaSerializer

    # Esto permite filtrar por ?moto_id=6 en la URL
    def get_queryset(self):
        queryset = GestorAlerta.objects.all()
        moto_id = self.request.query_params.get('moto_id')
        if moto_id is not None:
            queryset = queryset.filter(moto_id=moto_id)
        return queryset