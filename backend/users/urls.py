# backend/users/urls.py
from django.urls import path
from .views import RegistroUsuarioView, login_usuario, verificar_email # <--- Una sola línea con todos

urlpatterns = [
    path('register/', RegistroUsuarioView.as_view(), name='registro_usuario'),
    path('login/', login_usuario, name='login'),
    path('verificar-email/<str:email>/', verificar_email, name='verificar_email'),
]