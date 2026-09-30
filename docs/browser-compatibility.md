# Compatibilidade de Browsers

Registro manual exigido pelo plano técnico e pela spec do Weather App.

## Critério de liberação

O MVP só pode ser liberado quando cada combinação das duas últimas versões
estáveis de Chrome, Firefox, Safari e Edge tiver sido verificada em desktop e
mobile. Cada registro deve ter resultado `passed`.

A matriz Playwright automatizada fornece smoke coverage em Chromium, Firefox e
WebKit, mas não substitui este registro manual.

## Procedimento

Para cada combinação, executar o fluxo principal completo:

1. Abrir a aplicação.
2. Buscar uma cidade com acentos.
3. Selecionar explicitamente um resultado.
4. Conferir clima atual e previsão de cinco dias.
5. Alternar Celsius/Fahrenheit sem nova requisição.
6. Verificar loading, erro, retry, atribuição e navegação por teclado.
7. Confirmar ausência de rolagem horizontal no viewport mobile.

Registrar também foco visível, nomes acessíveis e comunicação dos estados de
loading e erro.

## Matriz

Preencher `version`, `device`, `checked_at`, `result` e `notes` após cada
verificação. Usar `passed` ou `failed` em `result`.

| Browser | Release | Form factor | Viewport | Version | Device/OS | Checked at | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chrome | Latest stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Chrome | Previous stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Chrome | Latest stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Chrome | Previous stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Firefox | Latest stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Firefox | Previous stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Firefox | Latest stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Firefox | Previous stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Safari | Latest stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Safari | Previous stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Safari | Latest stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Safari | Previous stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Edge | Latest stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Edge | Previous stable | Desktop | 1440x900 | TBD | TBD | TBD | pending | TBD |
| Edge | Latest stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |
| Edge | Previous stable | Mobile | 320x844 | TBD | TBD | TBD | pending | TBD |

## Falhas

Para cada resultado `failed`, registrar o comportamento observado, os passos
para reproduzir, o ambiente completo e a referência para a issue correspondente.
Uma falha aberta bloqueia a entrega do MVP.
