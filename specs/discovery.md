## Contexto

A empresa precisa de uma aplicação web de previsão do tempo que permita aos
usuários consultar rapidamente as condições meteorológicas de uma cidade e
planejar os próximos dias. A solução deve ser simples de usar, funcionar bem em
dispositivos móveis e atender usuários que preferem visualizar temperaturas em
Celsius ou Fahrenheit.

O produto inicial será uma experiência de consulta, sem necessidade de login ou
personalização. O fluxo principal esperado é: buscar uma cidade, selecionar o
resultado desejado e visualizar o clima atual e a previsão de cinco dias.

## Personas

### 1. Marina, usuária do dia a dia

- **Objetivo principal:** consultar rapidamente o clima da própria cidade para
	decidir o que vestir e organizar as atividades do dia.
- **Contexto de uso:** principalmente mobile, pela manhã ou antes de sair de
	casa, usando uma conexão móvel que pode ser instável.
- **Métrica de sucesso:** consegue buscar sua cidade e visualizar o clima atual
	em até um minuto, sem precisar repetir a consulta ou interpretar mensagens
	técnicas.

### 2. Rafael, viajante planejador

- **Objetivo principal:** consultar a previsão de cinco dias de um destino para
	planejar deslocamentos, passeios e bagagem.
- **Contexto de uso:** alterna entre desktop, durante o planejamento, e mobile,
	durante a viagem; pode pesquisar cidades diferentes em sequência.
- **Métrica de sucesso:** encontra o destino correto e compara os cinco dias de
	previsão sem confundir cidades homônimas ou perder o contexto da busca.

### 3. Chloe, usuária internacional

- **Objetivo principal:** visualizar temperaturas na unidade que conhece e
	consultar o clima de cidades em países diferentes.
- **Contexto de uso:** principalmente mobile, em viagens ou deslocamentos, com
	preferência por Fahrenheit e necessidade de distinguir país e região.
- **Métrica de sucesso:** alterna entre Celsius e Fahrenheit sem nova espera e
	identifica corretamente a cidade e a unidade exibida.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** A aplicação usará a Open-Meteo
	para geocoding e previsão meteorológica. A escolha elimina a necessidade de
	gerenciar credenciais no frontend, reduz a complexidade operacional e resolve
	a pergunta sobre qual fonte e modelo de autenticação serão adotados.
- **Contrato mínimo da API:** o geocoding usará `GET
	https://geocoding-api.open-meteo.com/v1/search` com `name`, `count=5`,
	`language=pt` e `format=json`. O forecast usará `GET
	https://api.open-meteo.com/v1/forecast` com latitude, longitude,
	`forecast_days=5`, `timezone=auto`, `current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code`
	e `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`.
	A API será consumida em suas unidades padrão: °C, km/h, hPa e mm. Isso
	resolve a ambiguidade dos endpoints, parâmetros, campos e unidades.
- **Período da previsão: hoje + 4 dias.** Os cinco dias exibidos incluem o dia
	atual e os quatro dias seguintes. Isso resolve a ambiguidade sobre o início da
	janela de previsão e define um contrato claro para a interface e os testes.
- **Unidade padrão: Celsius.** Temperaturas serão apresentadas inicialmente em
	Celsius, com possibilidade de alternância para Fahrenheit. Isso estabelece um
	padrão consistente para a primeira visita e resolve a pergunta sobre a unidade
	inicial.
- **Sem autenticação e sem persistência de servidor.** A primeira versão não
	terá contas de usuário, login, histórico ou dados persistidos em backend. Isso
	mantém o produto focado em consulta imediata, reduz responsabilidades de
	privacidade e resolve as perguntas sobre autenticação e persistência de dados.
- **Idioma da interface: pt-BR.** Textos, mensagens, unidades apresentadas e
	formatação da interface serão direcionados ao português do Brasil. Isso define
	o idioma inicial do produto e resolve a pergunta sobre localização da UI.
- **Fluxo de busca: envio explícito e seleção manual.** A busca será iniciada
	após o usuário enviar um nome não vazio; os resultados serão apresentados em
	uma lista limitada a cinco cidades, e nenhuma cidade será selecionada
	automaticamente, mesmo quando houver apenas uma correspondência. Isso reduz
	seleções acidentais e resolve as perguntas sobre autocomplete, limite de
	resultados e cidades homônimas.
- **Dados do clima atual:** a tela exibirá temperatura, condição meteorológica,
	umidade, vento, pressão e precipitação. A previsão diária exibirá data,
	temperaturas mínima e máxima, condição e probabilidade de precipitação. Isso
	define o contrato mínimo de dados e resolve a pergunta sobre as métricas
	exibidas.
- **Timezone e atualização:** as datas serão interpretadas no timezone retornado
	para a cidade consultada, e os dados serão atualizados somente quando o usuário
	realizar uma nova busca ou solicitar retry. A tela exibirá o horário da última
	atualização. Isso evita ambiguidades sobre o significado de “hoje” e sobre
	atualizações automáticas.
- **Persistência e offline:** não haverá persistência local ou no servidor e o
	app não oferecerá consulta offline no MVP. Sem conexão, a consulta exibirá
	erro e ação de retry. Isso fecha o comportamento de armazenamento e offline.
- **Erros e dados ausentes:** chamadas terão timeout de dez segundos. HTTP 429,
	timeout, falha de rede e payload inválido exibirão mensagem específica e retry.
	Campos opcionais ausentes serão exibidos como “Não disponível”; campos
	essenciais ausentes tornarão a resposta inválida. Isso define a política de
	resiliência e evita decisões diferentes entre telas.
- **Códigos meteorológicos:** os códigos WMO serão convertidos para rótulos em
	pt-BR por uma tabela local e terão um ícone associado. Isso fecha a regra de
	apresentação da condição meteorológica.
- **Escopo de plataforma:** o MVP será uma aplicação web responsiva, sem PWA,
	aplicativo nativo ou localização automática por GPS/IP. Isso mantém o escopo
	compatível com uma entrega web estática.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário informe um nome não vazio e
	inicie a busca por envio explícito do formulário.
- **RF2 — Exibir resultados de busca:** apresentar cidades correspondentes com
-	informações suficientes, como país, estado ou região, para diferenciar cidades
	com o mesmo nome, exibindo no máximo cinco resultados.
- **RF3 — Selecionar uma cidade:** permitir que o usuário escolha uma cidade
-	entre os resultados encontrados; nenhuma seleção automática será feita.
- **RF4 — Exibir clima atual:** mostrar temperatura, condição meteorológica,
	umidade, vento, pressão, precipitação e horário da última atualização da cidade
	selecionada.
- **RF5 — Exibir previsão:** mostrar cinco dias, correspondentes a hoje e aos
	quatro dias seguintes, com data, temperaturas mínima e máxima, condição
	meteorológica e probabilidade de precipitação.
- **RF6 — Alternar unidade de temperatura:** permitir alternar entre Celsius e
	Fahrenheit, atualizando todos os valores de temperatura exibidos.
- **RF7 — Tratar estados da experiência:** informar ao usuário quando a
	aplicação está carregando, quando não há resultados e quando ocorre um erro.
- **RF8 — Tentar novamente:** oferecer uma ação para repetir a consulta após uma
	falha recuperável, sem iniciar novas tentativas automaticamente.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a aplicação deve funcionar sem rolagem horizontal
	em larguras a partir de 320 px, além de tablets e telas maiores.
- **RNF2 — Usabilidade:** o fluxo de busca e consulta deve ser direto, com
	mensagens claras e controles fáceis de identificar.
- **RNF3 — Acessibilidade:** campos, botões e resultados devem possuir nomes
	acessíveis, permitir navegação por teclado, manter foco visível e atender ao
	nível AA da WCAG 2.1.
- **RNF4 — Desempenho:** a interface deve exibir feedback de loading no mesmo
	ciclo de interação do usuário, iniciar a apresentação do resultado em até três
	segundos quando a API responder nesse prazo e evitar nova consulta ao alternar
	a unidade de temperatura.
- **RNF5 — Disponibilidade de dados:** a aplicação deve depender de uma fonte de
	dados meteorológicos externa e lidar de forma previsível com HTTP 429, timeout,
	indisponibilidade e respostas incompletas, sem quebrar a interface.
- **RNF6 — Segurança e privacidade:** não exigir autenticação nem coletar dados
	pessoais para o fluxo principal.
- **RNF7 — Compatibilidade:** funcionar nas versões atuais de Chrome, Firefox,
	Safari e Edge em ambientes desktop e mobile.

## Critérios de Aceite Preliminares

- **RF1/RF2:** Dado um nome de cidade não vazio, quando o usuário enviar a
	busca, então o sistema deve consultar o geocoding e exibir no máximo cinco
	resultados com nome, país e estado ou região quando disponíveis.
- **RF3:** Dada uma lista com mais de uma cidade, quando o usuário selecionar um
	resultado, então o sistema deve carregar o clima das coordenadas selecionadas.
- **RF4:** Dada uma cidade selecionada, quando o forecast responder, então a
	tela deve exibir temperatura, condição, umidade, vento, pressão, precipitação
	e horário da última atualização.
- **RF5:** Dado um forecast válido, então a tela deve exibir exatamente cinco
	dias, correspondentes a hoje e aos quatro dias seguintes no timezone da
	cidade.
- **RF6:** Dado o app em Celsius, quando o usuário alternar para Fahrenheit,
	então todas as temperaturas devem ser convertidas sem nova chamada de rede.
- **RF7:** Durante uma chamada de rede, então deve haver loading; sem resultados,
	deve haver estado vazio; em falha, deve haver mensagem compreensível e ação de
	retry.
- **RF1:** Dado um campo vazio, quando o usuário tentar enviar a busca, então
	nenhuma chamada de rede deve ser feita e a interface deve orientar o
	preenchimento.
- **RF2:** Dado um nome sem correspondências, quando o geocoding responder, então
	deve haver estado vazio com orientação para revisar a busca.
- **RF3:** Dado exatamente um resultado, quando a lista for exibida, então o
	usuário ainda deverá selecioná-lo explicitamente para carregar o forecast.
- **RF4/RF5:** Dado um payload com campo opcional ausente, então o campo deve
	exibir “Não disponível”; se faltar um campo essencial, a resposta deve ser
	tratada como inválida.
- **RF8:** Dada uma falha de rede, timeout ou HTTP 429, quando o usuário acionar
	retry, então a consulta anterior deve ser repetida uma única vez por ação,
	sem tentativas automáticas.
- **RNF1/RNF3:** Dado um viewport de 320 px ou mais, quando o usuário navegar
	por teclado, então não deve haver rolagem horizontal e todos os controles devem
	ser acessíveis com foco visível.
- **RNF5:** Dada uma resposta HTTP 429, timeout ou payload incompleto, então a
	interface não deve quebrar e deve informar o próximo passo possível.

## Riscos

| Risco | Tipo | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- |
| Indisponibilidade, lentidão ou rate limiting da API meteorológica | Técnico | Média | Alto | Usar timeout, tratar status HTTP, exibir erro acionável, permitir retry e monitorar falhas. |
| Mudança ou incompatibilidade no contrato da API | Técnico | Média | Alto | Isolar a integração em um service, validar respostas e cobrir o mapeamento com testes automatizados. |
| Resultados ambíguos para cidades homônimas | Produto | Alta | Alto | Exibir país, estado ou região e exigir seleção explícita quando houver múltiplos resultados. |
| Dados incompletos ou inconsistentes | Técnico | Média | Alto | Validar campos essenciais, usar valores alternativos para campos opcionais e impedir que a UI quebre. |
| Falhas e timeouts em redes móveis instáveis | Técnico | Alta | Médio | Usar AbortController, feedback de loading, mensagens claras e ação de tentar novamente. |
| Conversão incorreta entre Celsius e Fahrenheit | Técnico | Baixa | Alto | Centralizar a conversão em função pura, manter os dados internos em Celsius e criar testes de casos-limite. |
| Excesso de informação ou layout inadequado em telas pequenas | Produto | Média | Médio | Adotar abordagem mobile-first, testar a partir de 320 px e priorizar as informações essenciais. |
| Diferenças de comportamento entre navegadores | Técnico | Média | Médio | Definir navegadores suportados e executar testes em navegadores e viewports representativos. |
| Baixa acessibilidade para teclado e leitores de tela | Produto | Média | Alto | Usar HTML semântico, labels, foco visível, navegação por teclado e validação com critérios WCAG 2.1 AA. |
| Abuso dos endpoints públicos ou rate limiting por excesso de chamadas | Técnico | Média | Alto | Limitar buscas ao envio explícito, evitar chamadas no autocomplete, aplicar timeout e tratar HTTP 429. |
| Escopo crescer com favoritos, alertas, mapas ou previsão por hora | Produto | Alta | Alto | Definir claramente o MVP, registrar itens fora de escopo e controlar mudanças por critérios de prioridade. |
| Métricas exibidas não atenderem às necessidades dos usuários | Produto | Média | Médio | Validar o conjunto de métricas com usuários e definir critérios de sucesso antes da implementação. |
| Previsões serem interpretadas como garantia, apesar da incerteza | Produto | Média | Médio | Exibir horário de atualização, origem dos dados e linguagem que deixe claro o caráter preditivo. |
| Expectativa de consulta offline no MVP | Produto | Média | Médio | Declarar offline como fora de escopo e informar erro de conexão com ação de retry. |

## Fora do Escopo do MVP

- PWA, aplicativos nativos e notificações push.
- Geolocalização automática por GPS ou IP.
- Login, contas, favoritos, histórico e persistência local ou em servidor.
- Consulta offline ou cache de dados meteorológicos antigos.
- Mapas, previsão por hora e alertas meteorológicos.

## Perguntas em Aberto (Open Questions)

- Como tratar erros de digitação, caracteres especiais e acentos no nome da
	cidade: normalização local, busca literal ou comportamento da API?
- Quais textos e ícones serão usados para cada código meteorológico da
	Open-Meteo?
- Qual será o limite de tempo exato para timeout e qual mensagem será exibida
	para cada classe de erro, incluindo HTTP 429?
- Campos opcionais ausentes devem exibir “Não disponível” ou outro valor
	padronizado?
- Qual ambiente de deploy será usado para o MVP e qual será o domínio público?
- Quais métricas de produto serão acompanhadas para validar sucesso, além das
	métricas qualitativas das personas?
- Quais erros devem ser monitorados em produção e por quanto tempo os logs
	serão mantidos?
- Há requisitos legais, corporativos ou de marca, incluindo revisão de
	privacidade e acessibilidade, que ainda precisam ser confirmados?
- As personas e suas métricas foram validadas com usuários ou são hipóteses
	iniciais para orientar o MVP?

## Suposições (Assumptions)

- A primeira versão será uma aplicação web responsiva, sem aplicativo nativo.
- O usuário terá conexão com a internet para consultar os dados meteorológicos.
- A aplicação não exigirá login, conta de usuário, localização automática ou
	persistência local.
- Celsius será a unidade padrão, com Fahrenheit disponível como alternativa.
- A Open-Meteo continuará disponível sem exigir chave de API para os endpoints
	necessários ao MVP.
- A previsão será apresentada para exatamente cinco dias: hoje e os quatro dias
	seguintes, incluindo temperaturas mínima e máxima, condição e probabilidade de
	precipitação.
- A busca será iniciada por envio explícito e retornará no máximo cinco
	resultados para evitar uma interface excessivamente extensa.
- País e estado ou região estarão disponíveis quando necessários para
	desambiguar cidades.
- A fonte de dados permitirá uso compatível com uma aplicação web estática e
	não exigirá um backend próprio na primeira versão.
- Datas e horários serão interpretados no timezone retornado pela API para a
	cidade consultada.
- A interface, mensagens e formatação inicial serão exclusivamente em pt-BR.
- A interface deverá comunicar claramente loading, erro e ausência de
	resultados, sem deixar o usuário sem feedback.
