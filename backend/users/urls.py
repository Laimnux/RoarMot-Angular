# backend/users/urls.py
from django.urls import path
from .views import RegistroUsuarioView, login_usuario, verificar_email # <--- Una sola línea con todos
from .views import (
    RegistroUsuarioView, 
    login_usuario, 
    verificar_email, 
    PerfilUsuarioView, 
    PedidoView
)

urlpatterns = [
    # --- AUTENTICACIÓN ---
    path('register/', RegistroUsuarioView.as_view(), name='registro_usuario'),
    path('login/', login_usuario, name='login'),
    path('verificar-email/<str:email>/', verificar_email, name='verificar_email'),

    # --- PERFIL Y LOGÍSTICA ---
    # GET para obtener datos, PUT para actualizar dirección/ciudad
    path('perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),

    # --- COMPRAS Y VENTAS ---
    # POST para crear pedido (Carrito), GET para ver historial/ventas (Panel)
    path('pedidos/', PedidoView.as_view(), name='pedidos'),
]