# Backlog de Tarefas do Weather App

Fonte: [plans/weather-app-plan.md](../plans/weather-app-plan.md).

As tarefas estão ordenadas por dependência na sequência: tipos, funções puras,
services, hook, componentes, integração, testes e hardening. Cada tarefa contém
critérios verificáveis e uma referência à spec na matriz de rastreabilidade. A
prioridade e o tamanho relativo estão na matriz de planejamento ao final.

## Entrega 1 — Fundação

### T-01 — Consolidar configuração do projeto

- **Descrição:** confirmar TypeScript strict, scripts e ferramentas do MVP.
- **Critérios de aceite:** `strict`, `noUnusedLocals` e `noUnusedParameters` estão ativos; `pnpm build` executa typecheck e build; `pnpm lint` e `pnpm test` possuem scripts funcionais.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `package.json`, `tsconfig.json`, `tsconfig.app.json`.
- **Tipo:** Infra

## Entrega 2 — Tipos e funções puras

### T-02 — Declarar tipos de domínio e API

- **Descrição:** criar contratos para cidade, clima, forecast, unidade, falhas e estado.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `WeatherFailure`, `WeatherError`, `WeatherState` e `lastRequest` estão tipados; payloads externos usam `unknown`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

### T-03 — Implementar temperatura e arredondamento

- **Descrição:** criar conversão Celsius/Fahrenheit e arredondamento de apresentação.
- **Critérios de aceite:** conversão nos dois sentidos é pura; valores internos permanecem em Celsius; arredondamento ocorre somente no texto exibido.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-04 — Implementar formatação de datas e valores

- **Descrição:** criar formatadores pt-BR para datas, números e campos indisponíveis.
- **Critérios de aceite:** datas usam timezone informado e fallback documentado; valores ausentes exibem `Não disponível`; nenhum formatador produz `NaN`, infinito ou texto `undefined`/`null`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data

### T-05 — Implementar mapeamento WMO

- **Descrição:** criar tabela de códigos, rótulos pt-BR, ícones e fallback desconhecido.
- **Critérios de aceite:** todos os códigos da spec têm rótulo e ícone; código desconhecido retorna `Condição não disponível` e `unknown`.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

### T-06 — Validar resultados de geocoding

- **Descrição:** criar guard e normalizador puro para cidades.
- **Critérios de aceite:** nome, latitude e longitude são obrigatórios; limites de coordenadas e números finitos são validados; campos opcionais válidos são preservados; resultados inválidos podem ser descartados.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/validation.ts`.
- **Tipo:** Data

### T-07 — Validar payload de forecast

- **Descrição:** criar guard e normalizador puro para current e arrays diários.
- **Critérios de aceite:** campos essenciais e data ISO são exigidos; há exatamente cinco posições; arrays paralelos têm o mesmo tamanho; opcionais ausentes viram `undefined`; falhas distinguem payload inválido de forecast incompleto.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/validation.ts`.
- **Tipo:** Data

## Entrega 3 — Services

### T-08 — Implementar transporte HTTP

- **Descrição:** criar fetch com timeout, abort, status HTTP e classificação técnica.
- **Critérios de aceite:** timeout de dez segundos aborta; status fora de 200–299 não é sucesso; rede, JSON e HTTP viram `WeatherFailure`; `Retry-After` aceita segundos e data HTTP; não há mensagem visual no service.
- **Dependências:** T-02, T-06, T-07.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-09 — Implementar service de geocoding

- **Descrição:** conectar a busca de cidades e normalizar seus resultados.
- **Critérios de aceite:** envia `name`, `count=5`, `language=pt` e `format=json` com `URLSearchParams`; resposta sem `results` retorna lista vazia; resultado final tem no máximo cinco `City`.
- **Dependências:** T-06, T-08.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-10 — Implementar service de forecast

- **Descrição:** conectar forecast usando exatamente a cidade selecionada.
- **Critérios de aceite:** envia coordenadas, `current`, `daily`, `forecast_days=5` e `timezone=auto`; não envia parâmetros alternativos; delega normalização; retorna `WeatherData` com cinco dias.
- **Dependências:** T-07, T-08, T-09.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

## Entrega 4 — Hook e estado

### T-11 — Implementar estado inicial e busca

- **Descrição:** criar `useWeather` com query, unidade e fluxo de busca.
- **Critérios de aceite:** estado inicia em idle e Celsius; query vazia não chama service; busca válida usa trim, limpa resultados e publica loading; sucesso, vazio e erro atualizam o estado da busca.
- **Dependências:** T-02, T-09.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-12 — Implementar seleção, forecast e concorrência

- **Descrição:** adicionar seleção explícita, request ids, abort e preservação do forecast.
- **Critérios de aceite:** nenhuma cidade é automática; forecast usa coordenadas selecionadas; resposta obsoleta não faz commit; último `WeatherData` permanece durante loading ou erro.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-13 — Implementar retry e alternância de unidade

- **Descrição:** adicionar `lastRequest`, retry limitado, `Retry-After` e `setUnit`.
- **Critérios de aceite:** retry repete query ou cidade originais; cada acionamento gera no máximo uma requisição; prazo válido bloqueia retry; `setUnit` não chama service e mantém Celsius interno.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes

### T-14 — Criar busca e resultados de cidades

- **Descrição:** implementar formulário e lista acessível com seleção explícita.
- **Critérios de aceite:** formulário tem label e envio explícito; mostra até cinco cidades com país/região; usa `listbox`/`option`; mouse e teclado permitem seleção; loading bloqueia ação incompatível.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI

### T-15 — Criar estados da experiência

- **Descrição:** implementar idle, loading, vazio e erro com mensagens pt-BR.
- **Critérios de aceite:** idle não mostra dados inventados; estados são anunciados; erro informa causa acionável; retry aparece apenas quando recuperável; detalhes técnicos não são expostos.
- **Dependências:** T-11, T-13.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`, `src/components/states/LoadingState.tsx`.
- **Tipo:** UI

### T-16 — Criar clima atual

- **Descrição:** implementar apresentação das condições atuais.
- **Critérios de aceite:** temperatura, condição, umidade, vento, pressão, precipitação e horário aparecem; opcionais exibem `Não disponível`; WMO desconhecido usa fallback.
- **Dependências:** T-03, T-04, T-05, T-12.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-17 — Criar previsão diária

- **Descrição:** implementar lista e cards de previsão.
- **Critérios de aceite:** exatamente cinco cards aparecem; cada um mostra data, mínima, máxima, condição e probabilidade; datas respeitam timezone; forecast incompleto não mostra parcial.
- **Dependências:** T-03, T-04, T-05, T-12.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI

### T-18 — Criar unidade e atribuição

- **Descrição:** implementar toggle Celsius/Fahrenheit e crédito Open-Meteo.
- **Critérios de aceite:** toggle inicia em Celsius e alterna nos dois sentidos; não gera request; link acessível aponta para `https://open-meteo.com/`; atribuição aparece em todos os estados.
- **Dependências:** T-04, T-13, T-15.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/components/Attribution.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração da aplicação

### T-19 — Compor a tela principal

- **Descrição:** conectar hook, estados e componentes em `App`.
- **Critérios de aceite:** `App.tsx` apenas compõe e encaminha handlers; nenhum componente chama API; o fluxo de idle até forecast funciona com as props e callbacks definidos.
- **Dependências:** T-14, T-15, T-16, T-17, T-18.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`.
- **Tipo:** UI

### T-20 — Aplicar layout responsivo e tema

- **Descrição:** aplicar dark glassmorphism, tokens e layout para desktop, tablet e 320 px.
- **Critérios de aceite:** não há rolagem horizontal em 320 px; controles são utilizáveis; foco visível e contraste AA são preservados; tema global é consistente.
- **Dependências:** T-01, T-19.
- **Arquivos prováveis:** `src/styles/index.css`, `tailwind.config.js`.
- **Tipo:** UI

## Entrega 7 — Testes

### T-21 — Testar conversão unitária de temperatura

- **Descrição:** testar unitariamente a conversão Celsius/Fahrenheit e o arredondamento exibido.
- **Critérios de aceite:** conversão Celsius para Fahrenheit, retorno para Celsius, valores negativos e arredondamento têm casos unitários; o valor Celsius de entrada nunca é mutado.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-22 — Testar WMO

- **Descrição:** testar códigos, rótulos, ícones e fallback.
- **Critérios de aceite:** cada código da spec e pelo menos um desconhecido têm casos; fallback retorna `unknown` sem falha de operação.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test

### T-23 — Testar validação de payloads

- **Descrição:** testar guards e normalizadores de geocoding e forecast.
- **Critérios de aceite:** casos válidos, campos ausentes, coordenadas inválidas, não finitos, arrays incompletos, divergentes e opcionais são cobertos.
- **Dependências:** T-06, T-07.
- **Arquivos prováveis:** `tests/unit/validation.test.ts`.
- **Tipo:** Test

### T-24 — Testar service com mock de fetch

- **Descrição:** testar o service isoladamente com `fetch` mockado, cobrindo URLs, parâmetros, timeout, abort e classificação.
- **Critérios de aceite:** `fetch` é mockado em todos os casos e nenhuma chamada real ocorre; endpoints verificam parâmetros permitidos e proibidos; rede, JSON inválido, HTTP, 429 e `Retry-After` são cobertos; service lança `WeatherFailure`.
- **Dependências:** T-08, T-09, T-10.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test

### T-25 — Testar hook e transições

- **Descrição:** testar estados, concorrência, seleção, retry, preservação e unidade.
- **Critérios de aceite:** estados são cobertos; `lastRequest` repete argumentos originais; resposta obsoleta é descartada; retry e `setUnit` respeitam chamadas máximas e prazo.
- **Dependências:** T-11, T-12, T-13.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test

### T-26 — Testar componentes nos estados loading, erro e vazio

- **Descrição:** testar componentes de busca e os estados loading, erro e vazio com Testing Library.
- **Critérios de aceite:** loading, erro e vazio têm casos dedicados; mensagens, roles, labels, foco e retry são verificáveis; `listbox`/`option` funciona por teclado; o estado idle também não exibe dados inventados.
- **Dependências:** T-14, T-15.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`, `tests/unit/App.test.tsx`.
- **Tipo:** Test

### T-27 — Testar componentes meteorológicos

- **Descrição:** testar clima atual, previsão, toggle e atribuição.
- **Critérios de aceite:** campos atuais, cinco cards, opcionais, WMO desconhecido, unidades e link são cobertos; toggle não chama rede.
- **Dependências:** T-16, T-17, T-18.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastCard.test.tsx`, `tests/unit/ForecastList.test.tsx`, `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test

### T-28 — Testar E2E do fluxo principal e viewport mobile

- **Descrição:** testar no browser o fluxo principal completo e o viewport mobile com rede interceptada.
- **Critérios de aceite:** nenhuma chamada real ocorre; busca com acentos, resultados, seleção explícita, clima atual e cinco dias funcionam; alternância não gera nova request; o cenário desktop e o viewport mobile de 320 px são executados sem rolagem horizontal.
- **Dependências:** T-19, T-20, T-26, T-27.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test

### T-29 — Testar E2E de resiliência e concorrência

- **Descrição:** testar rede, timeout, 429, payload inválido, retry e resposta obsoleta.
- **Critérios de aceite:** falhas são interceptadas; `Retry-After` bloqueia no prazo; retry repete uma operação; resposta antiga não substitui a nova; dados válidos são preservados.
- **Dependências:** T-28.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test

### T-30 — Testar E2E de acessibilidade e desempenho

- **Descrição:** verificar teclado, foco, anúncios, nomes acessíveis e limites de desempenho.
- **Critérios de aceite:** loading/erro são anunciados; controles são operáveis por teclado; foco é visível; resultado inicia em até 3 s após resposta; unidade atualiza em até 100 ms.
- **Dependências:** T-28.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening e release

### T-31 — Registrar compatibilidade manual

- **Descrição:** executar a matriz dos dois últimos releases estáveis e preencher o registro.
- **Critérios de aceite:** Chrome, Firefox, Safari e Edge são verificados em desktop e mobile; cada combinação registra versão, dispositivo, viewport, data, fluxos e resultado; nenhuma entrada fica `pending` ou `failed`.
- **Dependências:** T-29, T-30.
- **Arquivos prováveis:** `docs/browser-compatibility.md`.
- **Tipo:** Test

### T-32 — Executar hardening e gates de release

- **Descrição:** executar validações finais e confirmar o escopo aprovado do MVP.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam; não há falha de typecheck, acessibilidade ou overflow; matriz aprovada; não há persistência, analytics, deploy ou API real em CI.
- **Dependências:** T-01, T-21, T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31.
- **Arquivos prováveis:** `package.json`, `docs/browser-compatibility.md`, relatórios de testes.
- **Tipo:** Infra

## Rastreabilidade com a spec

| Tarefa | Requisitos, critérios ou edge cases relacionados |
| --- | --- |
| T-01 | Tech Stack; critérios de release de build, lint e typecheck. |
| T-02 | External API Contract; Experience State Contract; RF7/RF8. |
| T-03 | RF6 Unidade; NFR8 Regionalização; NFR10 Integridade visual. |
| T-04 | NFR8 Regionalização; NFR10 Integridade visual; edge case de timezone ausente. |
| T-05 | WMO weather codes; RF4; edge case de código desconhecido. |
| T-06 | HTTP and validation rules de geocoding, coordenadas e campos essenciais. |
| T-07 | HTTP and validation rules de forecast, data ISO, cinco dias e arrays paralelos. |
| T-08 | NFR4; HTTP and validation rules; timeout, rede, HTTP e `Retry-After`. |
| T-09 | RF1/RF2; critérios de query aparada, cidade inexistente e resultados limitados. |
| T-10 | RF4/RF5; contrato de Forecast; edge case de forecast incompleto. |
| T-11 | RF1; Experience State Contract; loading imediato e query vazia. |
| T-12 | RF3; RF4/RF5; concorrência e preservação do forecast. |
| T-13 | RF6/RF8; retry único; `Retry-After`; alternância durante loading. |
| T-14 | RF1/RF2/RF3; NFR2; seleção explícita e cidades homônimas. |
| T-15 | RF7/RF8; NFR2; idle, loading, vazio, erro e retry. |
| T-16 | RF4; campos atuais, opcionais e WMO desconhecido. |
| T-17 | RF5; timezone, cinco dias, dados diários e forecast incompleto. |
| T-18 | RF6; atribuição; alternância sem rede e link em todos os estados. |
| T-19 | NFR1/NFR2; integração do fluxo principal e separação de camadas. |
| T-20 | NFR1/NFR2; NFR8; edge case de viewport 320 px. |
| T-21 | NFR3/NFR8/NFR10; conversão, arredondamento e timezone. |
| T-22 | WMO weather codes; fallback `unknown`. |
| T-23 | HTTP and validation rules; payload inválido, incompleto e opcionais. |
| T-24 | NFR4/NFR6/NFR9; mocks externos, classificação e privacidade. |
| T-25 | RF7/RF8; NFR4; retry, timeout e busca concorrente. |
| T-26 | RF1/RF2/RF3/RF7/RF8; NFR2; teclado, foco e estados. |
| T-27 | RF4/RF5/RF6; atribuição; opcionais e ausência de nova chamada. |
| T-28 | RF1–RF6; NFR1; critérios E2E e viewport 320 px. |
| T-29 | RF7/RF8; NFR4; rede, timeout, 429, retry e obsolescência. |
| T-30 | NFR2/NFR3; acessibilidade e desempenho do fluxo principal. |
| T-31 | NFR5; critério de release da matriz manual. |
| T-32 | Testability and Release Criteria; Out of Scope; gates finais. |

## Rastreabilidade dos requisitos funcionais

| Requisito | Tarefas de implementação | Tarefas de teste/validação | Cobertura |
| --- | --- | --- | --- |
| RF1 — Buscar cidades | T-09, T-11, T-14, T-19 | T-26, T-28 | Coberto: query aparada, validação local, envio explícito e busca no browser. |
| RF2 — Exibir resultados | T-09, T-14, T-19 | T-23, T-26, T-28 | Coberto: até cinco cidades, país/região e estado vazio. |
| RF3 — Selecionar cidade | T-12, T-14, T-19 | T-25, T-26, T-28 | Coberto: seleção explícita, homônimos e coordenadas selecionadas. |
| RF4 — Exibir clima atual | T-10, T-12, T-16, T-19 | T-23, T-27, T-28 | Coberto: métricas atuais, opcionais, WMO e horário. |
| RF5 — Exibir previsão de cinco dias | T-10, T-12, T-17, T-19 | T-23, T-27, T-28 | Coberto: cinco dias, timezone, dados diários e forecast incompleto. |
| RF6 — Alternar unidade | T-03, T-13, T-18, T-19 | T-21, T-25, T-27, T-28 | Coberto: Celsius/Fahrenheit, retorno, arredondamento e ausência de rede. |
| RF7 — Informar estados da experiência | T-08, T-11, T-15, T-19 | T-24, T-25, T-26, T-29, T-30 | Coberto: loading, vazio, rede, timeout, 429 e payload inválido. |
| RF8 — Tentar novamente | T-08, T-13, T-15, T-19 | T-24, T-25, T-29, T-30 | Coberto: retry explícito, uma tentativa por acionamento e `Retry-After`. |

### Requisitos sem tarefa correspondente

Todos os requisitos funcionais `RF1` a `RF8` possuem pelo menos uma tarefa de
implementação e uma tarefa de teste ou validação. Não há requisito funcional
sem tarefa correspondente.

## Prioridade e tamanho relativo

Prioridades: `P0` é necessário para o fluxo principal ou para liberar o MVP;
`P1` é requisito importante que pode entrar após a primeira fatia vertical;
`P2` é melhoria ou verificação complementar sem bloquear o primeiro incremento
utilizável. Tamanhos: `P` é pequeno, `M` envolve uma unidade de trabalho com
vários cenários e `G` exige coordenação, múltiplos fluxos ou execução manual.

| Tarefa | Prioridade | Tamanho | Justificativa resumida |
| --- | --- | --- | --- |
| T-01 | P0 | P | Base necessária para compilar e validar. |
| T-02 | P0 | M | Contratos compartilhados por todas as camadas. |
| T-03 | P0 | P | Conversão isolada e determinística. |
| T-04 | P0 | P | Formatadores puros e limitados. |
| T-05 | P1 | P | Mapeamento local necessário para apresentação completa. |
| T-06 | P0 | M | Validação de geocoding com limites e opcionais. |
| T-07 | P0 | M | Validação de forecast e arrays paralelos. |
| T-08 | P0 | M | Timeout, abort, HTTP e classificação de falhas. |
| T-09 | P0 | M | Integração do endpoint de geocoding. |
| T-10 | P0 | M | Integração do endpoint de forecast. |
| T-11 | P0 | M | Estado inicial e fluxo de busca. |
| T-12 | P0 | M | Seleção, concorrência e preservação de dados. |
| T-13 | P0 | M | Retry, janela de espera e unidade. |
| T-14 | P0 | M | Busca e seleção visíveis ao usuário. |
| T-15 | P0 | P | Estados essenciais da experiência. |
| T-16 | P0 | M | Painel de clima atual. |
| T-17 | P0 | M | Previsão de cinco dias. |
| T-18 | P1 | P | Unidade visível e atribuição obrigatória. |
| T-19 | P0 | M | Composição do fluxo na aplicação. |
| T-20 | P1 | M | Responsividade, tema e acessibilidade visual. |
| T-21 | P0 | P | Regressão da conversão de unidade. |
| T-22 | P1 | P | Cobertura de tabela WMO e fallback. |
| T-23 | P0 | M | Contrato de payload externo. |
| T-24 | P0 | M | Contrato HTTP e falhas do service. |
| T-25 | P0 | M | Máquina de estados e concorrência. |
| T-26 | P0 | M | Interações e estados essenciais da UI. |
| T-27 | P0 | M | Dados meteorológicos e unidade na UI. |
| T-28 | P0 | G | Fluxo completo em browser e mobile. |
| T-29 | P1 | M | Falhas, retry e concorrência no browser. |
| T-30 | P1 | M | Acessibilidade integrada e desempenho. |
| T-31 | P1 | G | Matriz manual de quatro browsers e dois releases. |
| T-32 | P0 | M | Gate final de qualidade e escopo. |

## Sequência de fatias verticais

Cada fatia deve terminar com um incremento executável e demonstrável. As tarefas
listadas são cumulativas; tarefas compartilhadas de fundação podem ser feitas
antes da primeira fatia visível.

### Fatia 0 — Base executável

- **Tarefas:** T-01, T-02, T-03, T-04, T-06, T-07, T-08.
- **Entrega visível:** aplicação compila, contratos existem e os dados externos
	podem ser validados de forma determinística.
- **Pronto quando:** typecheck, lint e testes unitários iniciais executam sem
	depender da Open-Meteo real.

### Fatia 1 — Buscar e escolher uma cidade

- **Tarefas:** T-09, T-11, T-12, T-14, T-15, T-19, T-20.
- **Entrega visível:** usuário busca uma cidade, vê até cinco resultados, recebe
	estado vazio/erro e seleciona explicitamente uma localização em desktop ou
	mobile.
- **Pronto quando:** fluxo de busca está integrado, acessível e sem overflow em
	320 px, mesmo antes da renderização completa do forecast.

### Fatia 2 — Exibir clima atual e previsão

- **Tarefas:** T-05, T-10, T-16, T-17.
- **Entrega visível:** seleção de cidade mostra clima atual e exatamente cinco
	dias, incluindo WMO, opcionais e datas no timezone correto.
- **Pronto quando:** payload incompleto não produz dados parciais e o contrato
	do forecast está coberto por testes.

### Fatia 3 — Unidade e recuperação

- **Tarefas:** T-13, T-18, T-21, T-22, T-23, T-24, T-25, T-26, T-27.
- **Entrega visível:** usuário alterna Celsius/Fahrenheit, vê atribuição e pode
	recuperar erros de rede, timeout, 429 e payload inválido.
- **Pronto quando:** retry é explícito e limitado, respostas obsoletas são
	descartadas e os contratos unitários estão cobertos.

### Fatia 4 — Fluxo de browser e qualidade

- **Tarefas:** T-28, T-29, T-30.
- **Entrega visível:** fluxo completo demonstrável com rede interceptada, mobile,
	teclado, foco, anúncios e medição de desempenho.
- **Pronto quando:** E2E do caminho feliz e dos principais erros passa em
	Chromium, Firefox e WebKit.

### Fatia 5 — Compatibilidade e liberação

- **Tarefas:** T-31, T-32.
- **Entrega visível:** registro de compatibilidade preenchido e decisão objetiva
	de liberação do MVP.
- **Pronto quando:** não há browser pendente ou com falha e todos os gates
	`pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam.
