# Cypress – Geração de CPF e Coleta de CEPs de Manaus

Este projeto contém um script de testes automatizados em Cypress que realiza o seguinte fluxo:

1. **Geração de CPF via API**  
   - Faz requisições até obter um CPF que comece com “7”.

2. **Interação na interface de CEP**  
   - Acessa o gerador de CEP, aceita cookies, escolhe o Estado (AM) e a Cidade (Manaus).

3. **Coleta de 25 bairros**  
   - Clica repetidamente em “Gerar CEP”, captura o nome do bairro exibido e armazena em um array.

4. **Geração de relatório**  
   - Conta quantas vezes cada bairro apareceu e exporta um arquivo `bairros.csv` em `cypress/fixtures/`.

---

## Pré-requisitos

- Node.js (v14+)
- npm

---

## Instalação

```bash
git clone https://github.com/victorrferreiraa/cypress-cpf-cep-manaus.git
cd cypress-cpf-cep-manaus
npm install
