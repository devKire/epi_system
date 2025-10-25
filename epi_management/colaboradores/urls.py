from django.urls import path
from . import views

urlpatterns = [
    path('', views.lista_colaboradores, name='lista_colaboradores'),
    path('colaborador/novo/', views.criar_colaborador, name='criar_colaborador'),
    path('colaborador/<int:id>/', views.detalhes_colaborador, name='detalhes_colaborador'),
    path('colaborador/<int:id>/editar/', views.editar_colaborador, name='editar_colaborador'),
    path('colaborador/<int:id>/excluir/', views.excluir_colaborador, name='excluir_colaborador'),
]