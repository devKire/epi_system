from django.contrib import admin
from .models import Colaborador, EPI, Emprestimo

@admin.register(Colaborador)
class ColaboradorAdmin(admin.ModelAdmin):
    list_display = ['nome', 'cpf', 'setor', 'data_admissao', 'ativo']
    list_filter = ['setor', 'ativo']
    search_fields = ['nome', 'cpf']

@admin.register(EPI)
class EPIAdmin(admin.ModelAdmin):
    list_display = ['nome', 'categoria', 'estoque', 'validade_ca', 'ativo']
    list_filter = ['categoria', 'ativo']
    search_fields = ['nome', 'numero_ca']

@admin.register(Emprestimo)
class EmprestimoAdmin(admin.ModelAdmin):
    list_display = ['colaborador', 'epi', 'data_emprestimo', 'data_devolucao_prevista', 'status']
    list_filter = ['status', 'data_emprestimo']
    search_fields = ['colaborador__nome', 'epi__nome']