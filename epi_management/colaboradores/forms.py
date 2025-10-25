from django import forms
from .models import Colaborador, EPI, Emprestimo

class ColaboradorForm(forms.ModelForm):
    class Meta:
        model = Colaborador
        fields = ['nome', 'cpf', 'email', 'telefone', 'setor', 'data_admissao']
        widgets = {
            'data_admissao': forms.DateInput(attrs={'type': 'date'}),
            'nome': forms.TextInput(attrs={'class': 'form-control'}),
            'cpf': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'telefone': forms.TextInput(attrs={'class': 'form-control'}),
            'setor': forms.TextInput(attrs={'class': 'form-control'}),
        }

class EPIForm(forms.ModelForm):
    class Meta:
        model = EPI
        fields = ['nome', 'descricao', 'categoria', 'numero_ca', 'validade_ca', 'estoque', 'estoque_minimo']
        widgets = {
            'validade_ca': forms.DateInput(attrs={'type': 'date'}),
        }

class EmprestimoForm(forms.ModelForm):
    class Meta:
        model = Emprestimo
        fields = ['colaborador', 'epi', 'data_devolucao_prevista', 'observacoes']
        widgets = {
            'data_devolucao_prevista': forms.DateInput(attrs={'type': 'date'}),
        }