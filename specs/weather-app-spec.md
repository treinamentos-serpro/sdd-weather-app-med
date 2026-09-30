# Especificação do Weather App

## Overview

O Weather App é uma aplicação web responsiva para consulta de condições
meteorológicas. O usuário informa uma cidade, escolhe a localização correta e
visualiza o clima atual e uma previsão de cinco dias, correspondentes a hoje e
aos quatro dias seguintes.

O produto é destinado a três necessidades principais: consulta rápida do clima
do dia, planejamento de viagens e consulta internacional com alternância entre
Celsius e Fahrenheit. A interface será exclusivamente em pt-BR, terá Celsius
como unidade padrão e utilizará a Open-Meteo como fonte de dados, sem exigir
login ou chave de API.

O MVP será uma aplicação web responsiva, sem persistência local ou no servidor,
sem consulta offline e sem localização automática. O fluxo prioriza clareza,
acessibilidade, tratamento explícito de estados de rede e prevenção de seleção
incorreta entre cidades homônimas.

## External API Contract

### Geocoding

- Endpoint: `GET https://geocoding-api.open-meteo.com/v1/search`.
- Parâmetros obrigatórios: `name`, `count=5`, `language=pt` e `format=json`.
- A consulta deve ser codificada como parâmetro de URL antes do envio.
- Cada resultado deve fornecer, quando disponível, `name`, `country`,
  `admin1`, `latitude`, `longitude` e `timezone`.
- A ausência de `results` ou uma lista vazia representa ausência de resultados,
  não erro técnico.

### Forecast

- Endpoint: `GET https://api.open-meteo.com/v1/forecast`.
- A requisição deve conter os parâmetros `latitude`, `longitude`,
  `current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code`,
  `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
  `forecast_days=5` e `timezone=auto`.
- `latitude` e `longitude` devem ser os valores do resultado selecionado,
  serializados como números decimais. Os parâmetros `current` e `daily` devem
  ser codificados pela API de URL; a ordem dos parâmetros não é significativa.
- A unidade padrão da API deve ser usada: °C, km/h, hPa e mm. Não enviar
  `temperature_unit`, `wind_speed_unit`, `precipitation_unit` ou
  parâmetros `forecast_days` alternativos.
- Campos atuais solicitados: `temperature_2m`, `relative_humidity_2m`,
  `wind_speed_10m`, `surface_pressure`, `precipitation` e `weather_code`.
- Campos diários solicitados: `weather_code`, `temperature_2m_max`,
  `temperature_2m_min` e `precipitation_probability_max`.
- Os dados da previsão devem usar exatamente latitude e longitude do resultado
  selecionado pelo usuário.
- Campos essenciais são `current`, `current.time`, `current.temperature_2m`,
  `current.weather_code`, `daily.time`, `daily.weather_code`,
  `daily.temperature_2m_max` e `daily.temperature_2m_min`, todos com cinco
  posições nos arrays diários.
- Campos opcionais são `current.relative_humidity_2m`,
  `current.wind_speed_10m`, `current.surface_pressure`,
  `current.precipitation`, `daily.precipitation_probability_max` e o
  `timezone` do resultado de geocoding. Quando ausentes, devem ser exibidos
  como “Não disponível”; a ausência de um campo opcional não invalida o
  forecast.
- A fonte fornece temperatura em °C, vento em km/h, pressão em hPa e
  precipitação em mm. A conversão para Fahrenheit ocorre somente na camada de
  apresentação.

### WMO weather codes

| Código | Rótulo pt-BR | Ícone |
| ---: | --- | --- |
| 0 | Céu limpo | clear |
| 1 | Principalmente limpo | mostly-clear |
| 2 | Parcialmente nublado | partly-cloudy |
| 3 | Nublado | cloudy |
| 45, 48 | Nevoeiro | fog |
| 51, 53, 55 | Chuvisco | drizzle |
| 56, 57 | Chuvisco congelante | freezing-drizzle |
| 61, 63, 65 | Chuva | rain |
| 66, 67 | Chuva congelante | freezing-rain |
| 71, 73, 75, 77 | Neve | snow |
| 80, 81, 82 | Pancadas de chuva | rain-showers |
| 85, 86 | Pancadas de neve | snow-showers |
| 95 | Trovoada | thunderstorm |
| 96, 99 | Trovoada com granizo | thunderstorm-hail |

Código não listado deve usar o rótulo “Condição não disponível” e o ícone
`unknown`, sem interromper a renderização.

### Attribution and client behavior

- A interface deve exibir, no rodapé da aplicação, o texto “Dados
  meteorológicos por Open-Meteo” como link para
  `https://open-meteo.com/`. A atribuição deve aparecer em todos os estados da
  aplicação, inclusive quando não houver resultados ou ocorrer erro.
- O cliente deve cancelar ou descartar respostas de solicitações anteriores
  quando uma busca mais recente for iniciada; somente a solicitação mais
  recente pode atualizar a interface.
- O timeout de cada chamada é de dez segundos. Não haverá retry automático.

### HTTP and validation rules

- Respostas HTTP fora da faixa 200–299 devem ser convertidas em erro sem
  tentar interpretar o corpo como forecast.
- Respostas 429 devem ser classificadas separadamente. Se houver um cabeçalho
  `Retry-After` válido, a ação de retry deve permanecer desabilitada até o
  prazo indicado; não deve haver requisição automática.
- JSON inválido, valores numéricos não finitos, arrays de tamanhos diferentes
  ou coordenadas fora de latitude [-90, 90] e longitude [-180, 180] devem ser
  tratados como payload inválido.
- Para geocoding, cada resultado precisa ter `name`, `latitude` e `longitude`.
  `country`, `admin1` e `timezone` são opcionais; resultados sem os campos
  essenciais devem ser descartados.
- Para forecast, `current.time` deve ser uma data ISO 8601 e os arrays diários
  devem ter exatamente cinco itens. Os arrays de campos diários devem ter o
  mesmo tamanho de `daily.time` quando presentes.
- Erros de validação não devem expor detalhes técnicos ao usuário, mas devem
  ser classificados internamente como `invalid-payload`.

## Experience State Contract

Cada operação deve estar em exatamente um estado observável:

| Operação | Estados | Resultado esperado |
| --- | --- | --- |
| Busca de cidade | idle, loading, success, empty, error | A lista de resultados, o estado vazio ou a mensagem de erro substitui o estado anterior da busca. |
| Consulta de forecast | idle, loading, success, error | O clima exibido permanece visível durante loading; em erro, a última consulta válida continua disponível quando existir. |
| Retry | disponível, aguardando `Retry-After`, executando | Cada acionamento produz no máximo uma nova requisição e retorna ao estado apropriado. |

- No primeiro carregamento, `idle` deve mostrar apenas o formulário e a
  instrução inicial; não deve haver métricas inventadas ou skeleton que pareça
  dado real.
- Um novo envio de busca deve limpar os resultados anteriores e mostrar
  `loading`. A seleção de uma cidade deve iniciar o loading do forecast sem
  selecionar outra cidade automaticamente.
- A unidade selecionada deve ser `celsius` no início e deve permanecer durante
  uma nova consulta. A alternância durante loading deve ser refletida assim que
  os dados válidos forem renderizados.
- Cada estado de erro deve apresentar mensagem em pt-BR, causa acionável e
  controle com nome acessível. O retry só aparece quando há uma consulta
  recuperável associada.

## Functional Requirements

- **RF1 — Buscar cidades:** permitir que o usuário informe um nome não vazio e
  inicie a busca por envio explícito do formulário.
- **RF2 — Exibir resultados:** apresentar no máximo cinco cidades encontradas,
  mostrando nome, país e estado ou região quando disponíveis.
- **RF3 — Selecionar cidade:** permitir que o usuário selecione explicitamente
  uma cidade entre os resultados. Nenhuma cidade deve ser selecionada
  automaticamente, inclusive quando houver apenas uma correspondência.
- **RF4 — Exibir clima atual:** mostrar, para a cidade selecionada, temperatura,
  condição meteorológica, umidade, vento, pressão, precipitação e horário da
  última atualização.
- **RF5 — Exibir previsão de cinco dias:** mostrar hoje e os quatro dias
  seguintes, com data, temperaturas mínima e máxima, condição meteorológica e
  probabilidade de precipitação.
- **RF6 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit,
  atualizando todos os valores de temperatura sem realizar nova consulta de
  rede.
- **RF7 — Informar estados da experiência:** comunicar loading, ausência de
  resultados, erro de rede, timeout, limite de requisições e resposta inválida
  de forma compreensível.
- **RF8 — Tentar novamente:** oferecer uma ação explícita para repetir a última
  consulta recuperável, sem iniciar tentativas automáticas.

## User Stories

### US1 — Consulta cotidiana

Como Marina, usuária do dia a dia, quero buscar minha cidade e ver o clima
atual rapidamente para decidir como me vestir e organizar minhas atividades.

### US2 — Planejamento de viagem

Como Rafael, viajante planejador, quero consultar a previsão de cinco dias de
um destino para planejar passeios, deslocamentos e bagagem.

### US3 — Localização correta

Como viajante que pesquisa cidades homônimas, quero ver país e região nos
resultados para selecionar o destino correto.

### US4 — Unidade familiar

Como Chloe, usuária internacional, quero alternar entre Celsius e Fahrenheit
para interpretar as temperaturas na unidade que conheço.

### US5 — Uso móvel

Como usuário de celular, quero utilizar o app sem rolagem horizontal e com
controles acessíveis para consultar o clima durante deslocamentos.

### US6 — Recuperação de falha

Como usuário em uma rede instável, quero receber uma mensagem clara e poder
tentar novamente para recuperar a consulta sem recarregar a página.

## Acceptance Criteria

### RF1/RF2 — Busca e resultados

- **Dado** um campo vazio, **quando** o usuário tentar enviar a busca, **então**
  nenhuma chamada de rede deve ser feita e a interface deve orientar o
  preenchimento.
- **Dado** um nome não vazio, **quando** o usuário enviar o formulário,
  **então** devem ser exibidos no máximo cinco resultados de cidade e o estado
  de loading deve aparecer no mesmo ciclo da interação.
- **Dado** um nome com espaços no início ou no fim, **quando** o formulário for
  enviado, **então** a busca deve usar o valor aparado e não deve enviar uma
  consulta vazia.
- **Dado** um resultado com país e região disponíveis, **quando** a lista for
  exibida, **então** essas informações devem aparecer para desambiguar a cidade.
- **Dado** um nome sem correspondências, **quando** a busca terminar, **então**
  deve ser exibido um estado vazio orientando o usuário a revisar a busca.

### RF3 — Seleção de cidade

- **Dada** uma lista de resultados, **quando** o usuário selecionar uma cidade,
  **então** o app deve consultar o clima usando a localização selecionada.
- **Dado** exatamente um resultado, **quando** a lista for exibida, **então** o
  usuário ainda deve selecioná-lo explicitamente antes de carregar o clima.
- **Dada** uma lista com cidades homônimas, **quando** o usuário visualizar os
  resultados, **então** deve conseguir diferenciá-los por país e região quando
  essas informações existirem.
- **Dado** um resultado selecionado, **quando** o forecast for solicitado,
  **então** a requisição deve conter as coordenadas daquele resultado e o nome
  exibido deve permanecer associado ao forecast até uma nova seleção.

### RF4 — Clima atual

- **Dada** uma cidade selecionada e uma resposta válida, **quando** o clima for
  carregado, **então** devem ser exibidos temperatura, condição, umidade, vento,
  pressão, precipitação e horário da última atualização.
- **Dada** a ausência de um campo opcional, **quando** o clima for carregado,
  **então** somente o campo afetado deve exibir “Não disponível”, sem invalidar
  os demais dados.
- **Dada** uma condição meteorológica representada por código WMO, **quando**
  for exibida, **então** deve aparecer um rótulo em pt-BR e um ícone associado.
- **Dado** um código WMO não listado, **quando** for exibido, **então** deve
  aparecer “Condição não disponível” com o ícone `unknown`, sem impedir a
  exibição dos demais dados.

### RF5 — Previsão

- **Dada** uma resposta válida de previsão, **quando** os dados forem exibidos,
  **então** devem aparecer exatamente cinco dias: hoje e os quatro seguintes.
- **Dado** um timezone retornado para a cidade, **quando** as datas forem
  exibidas, **então** “hoje” deve ser calculado nesse timezone.
- **Para cada** dia, devem ser exibidas data, mínima, máxima, condição e
  probabilidade de precipitação.
- **Dado** um forecast com menos de cinco posições diárias, **quando** a
  resposta for processada, **então** nenhum dado parcial deve ser exibido e o
  usuário deve receber uma mensagem de previsão incompleta.

### RF6 — Unidade de temperatura

- **Dado** o app exibindo Celsius, **quando** o usuário selecionar Fahrenheit,
  **então** todas as temperaturas atuais e da previsão devem ser convertidas.
- **Quando** a unidade for alternada, **então** nenhuma nova chamada à API deve
  ser realizada.
- **Dado** o app exibindo Fahrenheit, **quando** o usuário voltar para Celsius,
  **então** os valores devem retornar aos valores correspondentes em Celsius.

### RF7/RF8 — Estados e recuperação

- **Durante** uma busca ou carregamento de clima, **então** a interface deve
  exibir um indicador de loading e impedir ações duplicadas incompatíveis.
- **Dada** uma falha de rede, timeout ou HTTP 429, **então** deve ser exibida
  uma mensagem específica para o tipo de falha, com uma ação de retry que
  preserve a última consulta válida.
- **Dado** um payload inválido ou com campo essencial ausente, **então** a
  interface não deve quebrar e deve informar que os dados não puderam ser
  carregados.
- **Quando** o usuário acionar retry, **então** a última consulta deve ser
  repetida uma única vez por ação, sem tentativas automáticas adicionais. Em
  HTTP 429, a mensagem deve informar que o limite foi atingido e o retry deve
  respeitar `Retry-After` quando esse cabeçalho estiver presente.
- **Quando** uma busca nova for iniciada antes da anterior terminar, **então**
  uma resposta antiga não poderá substituir resultados ou clima da busca mais
  recente.
- **Durante** loading, erro e sucesso, **então** o estado deve ter nome
  acessível e ser anunciado por tecnologia assistiva; todos os controles devem
  ser operáveis por teclado, ter foco visível e manter contraste conforme
  WCAG 2.1 AA.
- **Dado** um erro sem consulta recuperável, **quando** o estado de erro for
  exibido, **então** o botão de retry não deve ser apresentado.
- **Em qualquer estado da aplicação**, **então** o rodapé deve exibir o link de
  atribuição da Open-Meteo com nome acessível.

## Non-Functional Requirements

- **NFR1 — Responsividade:** não deve haver rolagem horizontal em viewports a
  partir de 320 px; a interface também deve ser utilizável em tablets e telas
  desktop.
- **NFR2 — Acessibilidade:** a aplicação deve atender WCAG 2.1 nível AA para o
  fluxo principal, incluindo nomes acessíveis, navegação por teclado, foco
  visível, contraste adequado e comunicação dos estados de loading e erro.
- **NFR3 — Desempenho:** o feedback de loading deve aparecer no mesmo ciclo de
  interação do usuário. Em condições de teste com resposta da API em até três
  segundos, o início do resultado deve ser apresentado em até três segundos a
  partir do recebimento da resposta. A troca de unidade deve ser concluída em
  até 100 ms, sem chamada de rede.
- **NFR4 — Resiliência:** timeout, falha de rede, HTTP 429, indisponibilidade e
  payload incompleto não devem quebrar a interface. O timeout do cliente será de
  dez segundos por requisição, contado a partir do início da chamada.
- **NFR5 — Compatibilidade:** o fluxo principal deve funcionar nas duas últimas
  versões estáveis de Chrome, Firefox, Safari e Edge em desktop e mobile.
- **NFR6 — Privacidade:** o MVP não deve exigir autenticação nem coletar dados
  pessoais. Não haverá persistência local, histórico ou dados armazenados em
  servidor. Consultas e coordenadas não devem ser registradas em logs ou
  analytics. Durante o desenvolvimento, erros técnicos podem ser exibidos no
  console local, sem incluir consulta, coordenadas ou dados pessoais.
- **NFR7 — Segurança:** entradas de busca devem ser codificadas antes de compor
  requisições, e nenhuma credencial deve ser exposta no cliente.
- **NFR8 — Idioma e regionalização:** textos, mensagens, rótulos de condições,
  datas e formatação inicial devem ser apresentados em pt-BR. Datas devem usar
  o timezone retornado pela API e o formato local de data; temperaturas devem
  ser arredondadas para o inteiro mais próximo na apresentação.

- **NFR9 — Observabilidade:** não haverá logs persistentes, analytics,
  monitoramento ou coleta de métricas no MVP. Durante o desenvolvimento, erros
  técnicos podem ser classificados e exibidos no console local pelos tipos
  rede, timeout, HTTP 429, payload inválido e forecast incompleto. O console
  não deve incluir consulta, coordenadas ou dados pessoais.

- **NFR10 — Integridade visual:** nenhum valor exibido pode ser `NaN`, infinito,
  `undefined` ou `null` textual. Valores indisponíveis devem usar somente o
  texto definido para o campo.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Campo de busca vazio ou apenas espaços | Não realizar chamada de rede e orientar o preenchimento. |
| Cidade inexistente | Exibir estado vazio e sugerir revisar a grafia. |
| Acentos e caracteres especiais | Codificar a consulta e permitir que a API processe o nome sem quebrar a interface. |
| Cidades homônimas | Exibir país e região quando disponíveis e exigir seleção explícita. |
| Geocoding sem campo `results` | Tratar como ausência de resultados, sem erro técnico visível. |
| Falha de rede | Exibir mensagem de conexão e ação de retry. |
| Timeout após dez segundos | Encerrar a chamada, informar demora excessiva e permitir retry. |
| HTTP 429 | Informar indisponibilidade temporária ou limite atingido e permitir nova tentativa explícita. |
| Forecast com payload inválido | Exibir erro de dados e não renderizar métricas potencialmente incorretas. |
| Campo opcional ausente | Exibir “Não disponível” no campo correspondente. |
| Campo essencial ausente | Considerar a resposta inválida e exibir estado de erro. |
| Forecast com menos de cinco dias | Considerar a resposta inválida e informar que a previsão está incompleta. |
| Alternância Celsius/Fahrenheit durante carregamento | Manter o controle consistente e aplicar a unidade escolhida quando os dados forem exibidos. |
| Busca nova antes da anterior terminar | Exibir apenas o resultado da solicitação mais recente. |
| Viewport de 320 px | Manter todos os controles utilizáveis sem rolagem horizontal. |
| Código WMO desconhecido | Exibir “Condição não disponível” e manter os demais dados renderizados. |
| Timeout ou erro durante retry | Manter a ação de retry disponível e não iniciar nova tentativa automaticamente. |
| Falta de timezone | Usar o timezone do dispositivo apenas como fallback e sinalizar a decisão nos testes. |

## Testability and Release Criteria

- Testes unitários devem cobrir: aparo e validação da busca, construção das
  URLs, validação de payload, conversão °C/°F, arredondamento, mapeamento WMO,
  classificação de erros e cálculo dos cinco dias.
- Testes de componente devem cobrir todos os estados da tabela de experiência,
  seleção manual, retry, ausência de campos opcionais, bloqueio de ações
  incompatíveis e atualização de unidade sem nova chamada de rede.
- Testes E2E devem cobrir o fluxo de busca até forecast, cidade homônima,
  viewport de 320 px, navegação por teclado, erro recuperável e resposta
  obsoleta de busca concorrente.
- As chamadas externas devem ser simuladas nos testes automatizados. Nenhum
  teste de CI pode depender da disponibilidade da Open-Meteo.
- A entrega fica bloqueada se houver erro de build, lint, typecheck, teste
  automatizado, rolagem horizontal em 320 px ou falha de acessibilidade do
  fluxo principal.
- A verificação manual de compatibilidade deve registrar navegador, versão,
  viewport e resultado para as duas últimas versões estáveis de Chrome,
  Firefox, Safari e Edge.

## Assumptions

- A Open-Meteo permanecerá disponível sem API key para os endpoints necessários
  ao MVP.
- A Open-Meteo fornecerá os dados em °C, km/h, hPa e mm, conforme os campos
  selecionados.
- O timezone retornado pela API será suficiente para interpretar “hoje” e as
  datas da previsão.
- O usuário terá conexão com a internet para realizar consultas.
- A primeira versão será uma aplicação web estática responsiva, sem PWA,
  aplicativo nativo ou geolocalização automática, executada somente em ambiente
  de desenvolvimento. Não haverá ambiente de produção ou deploy público no
  MVP.
- A aplicação não terá login, contas, favoritos, histórico, persistência local
  ou persistência em servidor.
- A previsão exibida será exatamente de hoje mais os quatro dias seguintes.
- A tabela local de códigos WMO terá cobertura para todos os códigos suportados
  no contrato; códigos fora da tabela usarão o fallback definido na spec.
- O timezone retornado pela API estará disponível; na ausência dele, será usado
  o timezone do dispositivo somente como fallback.
- A ausência de timezone no forecast não invalida os dados; o fallback do
  dispositivo será usado apenas para formatar datas e não será enviado como
  substituição de `timezone=auto`.
- Personas e métricas são hipóteses iniciais e deverão ser validadas após o
  primeiro uso ou pesquisa com usuários.

## Risks

- **Disponibilidade da Open-Meteo:** indisponibilidade, lentidão ou rate
  limiting podem impedir consultas. Mitigação: timeout, estados de erro,
  retry explícito e testes com respostas simuladas.
- **Mudança no contrato da API:** alteração de campos ou códigos pode quebrar o
  mapeamento. Mitigação: validação de payload, service isolado e testes de
  contrato.
- **Seleção incorreta de cidades:** cidades homônimas podem gerar previsão para
  a localização errada. Mitigação: país/região visíveis e seleção manual.
- **Dados meteorológicos incompletos:** campos ausentes podem produzir uma
  visualização enganosa. Mitigação: distinguir campos essenciais e opcionais e
  mostrar “Não disponível” quando aplicável.
- **Uso em redes móveis:** timeout e falhas são prováveis em deslocamento.
  Mitigação: loading, timeout de dez segundos, mensagens claras e retry.
- **Conversão de unidades:** erro de cálculo ou arredondamento pode alterar a
  interpretação da temperatura. Mitigação: função pura, dados internos em
  Celsius e testes de conversão.
- **Escopo do MVP:** inclusão de mapas, alertas, histórico ou offline pode
  aumentar o escopo. Mitigação: manter esses itens fora do escopo e controlar
  mudanças por prioridade.
- **Acessibilidade e mobile:** uma interface visualmente correta pode falhar
  para teclado, leitor de tela ou telas pequenas. Mitigação: critérios WCAG,
  testes em viewport de 320 px e testes de navegação.

## Out of Scope

- PWA, aplicativos nativos e notificações push.
- Login, contas, favoritos, histórico e personalização persistente.
- Persistência local, persistência em servidor, cache durável e consulta offline.
- Geolocalização automática por GPS ou IP.
- Mapas, previsão por hora, alertas meteorológicos e recomendações pessoais.
- Internacionalização além da interface inicial em pt-BR.
- Administração de dados meteorológicos ou edição manual de previsões.
- Ambiente de produção, domínio público, deploy, monitoramento e SLA.
- Logs persistentes, analytics, métricas de produto e dashboards operacionais.
- Compartilhamento, exportação ou download de consultas e previsões.

## Open Questions

- **Pós-MVP:** definir métricas de produto adicionais às métricas qualitativas
  das personas e validar essas personas com usuários.

## Traceability

### User Story Traceability

| User story | Acceptance criteria covered | Relevant non-functional requirements |
| --- | --- | --- |
| US1 — Consulta cotidiana | RF1/RF2: busca não vazia, loading imediato, aparo de espaços, resultados e estado vazio. RF3: seleção explícita. RF4: clima atual, campos opcionais e código WMO. | NFR1 responsividade; NFR2 acessibilidade; NFR3 desempenho; NFR4 resiliência; NFR8 pt-BR; NFR10 integridade visual. |
| US2 — Planejamento de viagem | RF3: uso das coordenadas da cidade selecionada. RF5: cinco dias, cálculo de “hoje” no timezone, dados diários e forecast incompleto. | NFR1 responsividade; NFR2 acessibilidade; NFR3 desempenho; NFR4 resiliência; NFR5 compatibilidade; NFR8 regionalização; NFR10 integridade visual. |
| US3 — Localização correta | RF1/RF2: resultados com país e região. RF3: seleção explícita, cidades homônimas e associação entre nome e coordenadas. | NFR1 responsividade; NFR2 acessibilidade; NFR4 resiliência; NFR5 compatibilidade; NFR8 pt-BR. |
| US4 — Unidade familiar | RF4: temperatura atual e previsão. RF6: conversão Celsius/Fahrenheit, retorno a Celsius, ausência de rede e alternância durante loading. | NFR2 acessibilidade; NFR3 troca em até 100 ms; NFR5 compatibilidade; NFR8 formatação; NFR10 integridade visual. |
| US5 — Uso móvel | RF1/RF2: formulário, resultados e estados de loading/vazio. RF7/RF8: controles durante loading, estados acessíveis e retry quando aplicável. | NFR1 viewport mínimo de 320 px; NFR2 WCAG 2.1 AA; NFR3 desempenho; NFR5 compatibilidade; NFR8 pt-BR. |
| US6 — Recuperação de falha | RF7/RF8: erros de rede, timeout, 429, payload inválido, retry único, `Retry-After`, concorrência e ausência de retry sem consulta recuperável. | NFR2 acessibilidade; NFR3 feedback de loading; NFR4 timeout e resiliência; NFR5 compatibilidade; NFR6 privacidade; NFR9 console local sem dados sensíveis. |

### Requirement Traceability

| Requirement | User stories | Acceptance criteria / edge cases |
| --- | --- | --- |
| RF1/RF2 | US1, US3 | Busca e resultados; campo vazio, cidade inexistente e homônimos. |
| RF3 | US3 | Seleção; uma correspondência, homônimos e coordenadas selecionadas. |
| RF4 | US1, US4 | Clima atual; payload válido, campos opcionais e WMO desconhecido. |
| RF5 | US2 | Previsão; timezone, cinco dias e forecast incompleto. |
| RF6 | US4 | Unidade; conversão sem rede e alternância durante loading. |
| RF7/RF8 | US6 | Estados; rede, timeout, 429, payload inválido e retry. |
| NFR1/NFR2 | US5 | Viewport de 320 px, teclado, foco, contraste e estados acessíveis. |
| NFR3-NFR10 | US1-US6 | Tempo de resposta, timeout, compatibilidade, privacidade, console local e integridade visual. |
