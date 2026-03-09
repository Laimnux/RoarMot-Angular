# backend/users/urls.py
from django.urls import path
from .views import RegistroUsuarioView
from .views import RegistroUsuarioView, login_usuario

urlpatterns = [
    path('register/', RegistroUsuarioView.as_view(), name='registro_usuario'),
    path('login/', login_usuario, name='login'),
]