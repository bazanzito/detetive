# Detective — esqueleto do bot (lobby + distribuição de cartas)

Fase 1: sala de espera (criar partida, entrar, sair, ver regras, iniciar).
Fase 2: ao iniciar, o bot sorteia o envelope secreto (suspeito + local + arma)
e distribui as cartas restantes entre os jogadores, usando **Ephemeral
Messages** (Bot API 10.2+) — cada mão de cartas aparece dentro do próprio
grupo, mas só o dono dela consegue ver. Não é mais necessário que os
jogadores tenham iniciado conversa privada com o bot.

Turnos, sugestões/verificação de cartas e o notebook de dedução entram em um
próximo módulo, no ponto marcado com `TODO` em `src/index.js`.

**Importante:** mensagens efêmeras exigem que o servidor do Bot API esteja
na versão 10.2 ou superior (padrão em api.telegram.org desde 14/07/2026).
Se você usa um Bot API Server local desatualizado, precisará atualizá-lo.

## Como rodar

1. Crie um bot com o [@BotFather](https://t.me/BotFather) e copie o token.
2. Copie `.env.example` para `.env` e cole o token em `BOT_TOKEN`.
3. Instale as dependências e rode:

```bash
npm install
npm start
```

4. Adicione o bot a um grupo do Telegram e use `/newgame`.

## Estrutura

- `src/lobby.js` — estado da partida (jogadores, status, regras de entrada/saída)
- `src/keyboards.js` — texto e botões (inline keyboard) da mensagem de lobby
- `src/cards.js` — catálogo de suspeitos, locais e armas
- `src/deck.js` — sorteia o envelope do caso e distribui as cartas
- `src/ephemeral.js` — helper para enviar/editar/apagar mensagens efêmeras
- `src/index.js` — comandos (`/newgame`, `/endgame`) e callbacks dos botões

## Comandos

- `/newgame` — cria uma partida no grupo (min. 3, máx. 6 jogadores)
- `/endgame` — cancela a partida (só o host)

## Próximos passos sugeridos

- Sistema de turnos: mover, investigar, sugerir
- Verificação privada de cartas entre jogadores
- Notebook de dedução por jogador
- Acusação final
