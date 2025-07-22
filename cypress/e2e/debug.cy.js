import 'cypress-wait-until';

describe('CPF via API e CEP via UI (Manaus-AM)', () => {
  it('A. Gera CPF iniciando com 7 e coleta 25 bairros de Manaus via UI', () => {
    const bairros = [];

    // A. Gera CPF via API até encontrar um que comece com 7
    const gerarCPFviaAPI = () => {
      cy.log('A.1 Geração de CPF via API');
      cy.request({
        method: 'POST',
        url: 'https://www.4devs.com.br/ferramentas_online.php',
        form: true,
        body: {
          acao: 'gerar_cpf',
          pontuacao: 'n'
        }
      }).then((resp) => {
        const cpf = resp.body.replace(/\D/g, '');
        cy.log(`A.2 CPF retornado: ${cpf}`);
        if (cpf.startsWith('7')) {
          cy.log(`A.3 CPF válido (começa com 7): ${cpf}`);
          coletar25BairrosViaUI();
        } else {
          cy.log('A.4 CPF inválido, repetindo...');
          gerarCPFviaAPI();
        }
      });
    };

    // B. Abre o gerador de CEP e interage via interface
    const coletar25BairrosViaUI = (vezes = 25) => {
      cy.log('B.1 Visitando gerador de CEP');
      cy.visit('https://www.4devs.com.br/gerador_de_cep', { timeout: 60000 });

      // B.2 Aceita cookies se necessário
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("ACEITAR TODOS")').length) {
          cy.log('B.3 Aceitando cookies');
          cy.contains('button', /aceitar todos/i).click({ force: true });
        }
      });

      // C. Seleciona estado AM
      cy.log('C. Selecionando estado AM');
      cy.get('#cep_estado', { timeout: 10000 })
        .should('exist')
        .select('AM');

      // D. Seleciona cidade Manaus
      cy.log('D. Selecionando cidade Manaus');
      cy.get('#cep_cidade', { timeout: 10000 })
        .should('exist')
        .select('Manaus');

      // E. Marca "Não" em gerar com pontuação
      cy.log('E. Marcando opção Não para pontuação');
      cy.get('input[type="radio"][value="N"]', { timeout: 5000 })
        .check({ force: true });

      // F. Loop para gerar 25 vezes e coletar bairros
      const coletar = (restantes) => {
        if (restantes === 0) {
          // G. Final: verifica repetições e escreve CSV
          cy.log('F.1 Concluídos 25 bairros, montando relatório');
          const contagem = bairros.reduce((acc, b) => {
            acc[b] = (acc[b] || 0) + 1;
            return acc;
          }, {});
          const repetidos = Object.entries(contagem)
            .filter(([, qtd]) => qtd > 1)
            .map(([b, qtd]) => `${b}: ${qtd}`);
          cy.log('F.2 Bairros repetidos: ' + (repetidos.length ? repetidos.join(', ') : 'Nenhum'));

          // escreve CSV com todos os bairros e a contagem final
          const linhas = [
            'bairro,quantidade',
            ...Object.entries(contagem).map(([b, qtd]) => `${b},${qtd}`)
          ].join('\n');
          cy.writeFile('cypress/fixtures/bairros.csv', linhas);
          cy.log('F.3 Arquivo bairros.csv gerado em cypress/fixtures');
          return;
        }

        cy.log(`F.4 Gerando CEP e capturando bairro (${26 - restantes}/25)`);
        cy.get('#btn_gerar_cep').click();
        cy.wait(800);

        cy.get('#bairro.output-txt')
          .invoke('text')
          .then((txt) => {
            const bairro = txt.trim();
            cy.log(`F.5 Bairro capturado: ${bairro}`);
            bairros.push(bairro);
            coletar(restantes - 1);
          });
      };

      coletar(vezes);
    };

    gerarCPFviaAPI();
  });
});
