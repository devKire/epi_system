from django.db import models

class Colaborador(models.Model):
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    email = models.EmailField()
    telefone = models.CharField(max_length=15)
    setor = models.CharField(max_length=50)
    data_admissao = models.DateField()
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

class EPI(models.Model):
    CATEGORIAS = [
        ('PROTECAO_CABECA', 'Proteção da Cabeça'),
        ('PROTECAO_AUDITIVA', 'Proteção Auditiva'),
        ('PROTECAO_RESPIRATORIA', 'Proteção Respiratória'),
        ('PROTECAO_MÃOS', 'Proteção das Mãos'),
        ('PROTECAO_PÉS', 'Proteção dos Pés'),
    ]
    
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    categoria = models.CharField(max_length=50, choices=CATEGORIAS)
    numero_ca = models.CharField(max_length=50, verbose_name='Número do CA')
    validade_ca = models.DateField(verbose_name='Validade do CA')
    estoque = models.IntegerField(default=0)
    estoque_minimo = models.IntegerField(default=5)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Emprestimo(models.Model):
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('DEVOLVIDO', 'Devolvido'),
        ('VENCIDO', 'Vencido'),
    ]
    
    colaborador = models.ForeignKey(Colaborador, on_delete=models.CASCADE)
    epi = models.ForeignKey(EPI, on_delete=models.CASCADE)
    data_emprestimo = models.DateField(auto_now_add=True)
    data_devolucao_prevista = models.DateField()
    data_devolucao_real = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO')
    observacoes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.colaborador.nome} - {self.epi.nome}"