# Sistema de Gestão de EPIs

Sistema para gerenciamento de Equipamentos de Proteção Individual em empresas de construção civil.

## Como executar

### Método 1: Ambiente Local

```bash
# Clonar repositório
git clone [url-do-repositorio]
cd epi_management

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```
