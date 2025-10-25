from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Colaborador
from .forms import ColaboradorForm

def lista_colaboradores(request):
    colaboradores = Colaborador.objects.filter(ativo=True)
    return render(request, 'colaboradores/lista.html', {'colaboradores': colaboradores})

def detalhes_colaborador(request, id):
    colaborador = get_object_or_404(Colaborador, id=id)
    return render(request, 'colaboradores/detalhes.html', {'colaborador': colaborador})

def criar_colaborador(request):
    if request.method == 'POST':
        form = ColaboradorForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Colaborador cadastrado com sucesso!')
            return redirect('lista_colaboradores')
    else:
        form = ColaboradorForm()
    return render(request, 'colaboradores/form.html', {'form': form, 'titulo': 'Novo Colaborador'})

def editar_colaborador(request, id):
    colaborador = get_object_or_404(Colaborador, id=id)
    if request.method == 'POST':
        form = ColaboradorForm(request.POST, instance=colaborador)
        if form.is_valid():
            form.save()
            messages.success(request, 'Colaborador atualizado com sucesso!')
            return redirect('lista_colaboradores')
    else:
        form = ColaboradorForm(instance=colaborador)
    return render(request, 'colaboradores/form.html', {'form': form, 'titulo': 'Editar Colaborador'})

def excluir_colaborador(request, id):
    colaborador = get_object_or_404(Colaborador, id=id)
    if request.method == 'POST':
        colaborador.ativo = False
        colaborador.save()
        messages.success(request, 'Colaborador excluído com sucesso!')
        return redirect('lista_colaboradores')
    return render(request, 'colaboradores/confirmar_exclusao.html', {'colaborador': colaborador})