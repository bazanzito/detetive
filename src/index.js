// index.js
// Ponto de entrada do bot. Cuida só da fase de LOBBY:
//   /newgame -> cria a sala
//   Entrar / Sair -> gerencia jogadores
//   Regras -> mostra as regras (resposta efêmera via answerCallbackQuery)
//   Iniciar -> valida e marca o jogo como "started"
//
// A partir daí (game.status === "started") é onde o próximo módulo
// (motor do jogo: distribuição de cartas, turnos, sugestões) deve assumir.

import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { LobbyManager, MIN_PLAYERS } from "./lobby.js";
import { lobbyText, lobbyKeyboard, RULES_TEXT } from "./keyboards.js";
import { dealGame } from "./deck.js";
import { cardLabel } from "./cards.js";
import { sendEphemeral, sendEphemeralReplacingCallback } from "./ephemeral.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Falta BOT_TOKEN no .env (veja .env.example)");
  process.exit(1);
}

const bot = new Bot(token);
const lobbies = new LobbyManager();

function displayName(user) {
  return user.first_name + (user.last_name ? ` ${user.last_name}` : "");
}

async function renderLobby(ctx, chatId, game) {
  const text = lobbyText(game);
  const keyboard = lobbyKeyboard(game);

  if (game.messageId) {
    try {
      await ctx.api.editMessageText(chatId, game.messageId, text, {
        reply_markup: keyboard,
      });
      return;
    } catch {
      // mensagem antiga pode ter sido apagada; cai para reenviar abaixo
    }
  }
  const msg = await ctx.api.sendMessage(chatId, text, { reply_markup: keyboard });
  game.messageId = msg.message_id;
}

bot.command("newgame", async (ctx) => {
  const chatId = ctx.chat.id;

  if (ctx.chat.type === "private") {
    return ctx.reply("Esse jogo é pra ser jogado em um grupo, não no privado 🙂");
  }

  if (lobbies.hasGame(chatId)) {
    return ctx.reply("Já existe uma partida em andamento nesse grupo. Use /endgame para cancelá-la.");
  }

  const host = { id: ctx.from.id, name: displayName(ctx.from) };
  const game = lobbies.createGame(chatId, host);
  await renderLobby(ctx, chatId, game);
});

bot.command("endgame", async (ctx) => {
  const chatId = ctx.chat.id;
  const game = lobbies.getGame(chatId);
  if (!game) return ctx.reply("Não há partida ativa nesse grupo.");
  if (game.hostId !== ctx.from.id) {
    return ctx.reply("Só quem criou a partida pode encerrá-la.");
  }
  lobbies.endGame(chatId);
  await ctx.reply("Partida cancelada.");
});

bot.callbackQuery("join_game", async (ctx) => {
  const chatId = ctx.chat.id;
  const game = lobbies.getGame(chatId);
  if (!game) return ctx.answerCallbackQuery({ text: "Essa partida não existe mais." });

  const player = { id: ctx.from.id, name: displayName(ctx.from) };
  const result = lobbies.addPlayer(chatId, player);

  if (!result.ok) {
    const messages = {
      already_started: "O jogo já começou.",
      already_joined: "Você já está nessa partida.",
      full: "A partida já está cheia.",
    };
    return ctx.answerCallbackQuery({ text: messages[result.reason] ?? "Não foi possível entrar." });
  }

  await ctx.answerCallbackQuery({ text: "Você entrou na partida!" });
  await renderLobby(ctx, chatId, result.game);
});

bot.callbackQuery("leave_game", async (ctx) => {
  const chatId = ctx.chat.id;
  const result = lobbies.removePlayer(chatId, ctx.from.id);
  if (!result.ok) return ctx.answerCallbackQuery({ text: "Essa partida não existe mais." });

  await ctx.answerCallbackQuery({ text: "Você saiu da partida." });

  if (result.game.players.length === 0) {
    lobbies.endGame(chatId);
    return ctx.editMessageText("Todos saíram — partida encerrada.");
  }
  await renderLobby(ctx, chatId, result.game);
});

bot.callbackQuery("show_rules", async (ctx) => {
  const chatId = ctx.chat.id;
  // Mostra as regras como mensagem efêmera, substituindo a msg original pra
  // esse usuário só — não gasta um "answerCallbackQuery" separado.
  await sendEphemeralReplacingCallback(ctx.api, chatId, ctx.callbackQuery.id, RULES_TEXT);
});

bot.callbackQuery("start_game", async (ctx) => {
  const chatId = ctx.chat.id;
  const result = lobbies.startGame(chatId, ctx.from.id);

  if (!result.ok) {
    const messages = {
      no_game: "Essa partida não existe mais.",
      not_host: "Só quem criou a partida pode iniciá-la.",
      not_enough_players: `São necessários pelo menos ${MIN_PLAYERS} jogadores.`,
    };
    return ctx.answerCallbackQuery({ text: messages[result.reason] ?? "Não foi possível iniciar." });
  }

  await ctx.answerCallbackQuery({ text: "Partida iniciada!" });
  const game = result.game;
  const names = game.players.map((p) => p.name).join(", ");

  await ctx.editMessageText(
    `🔎 caso ${game.caseId} — ${game.caseName}\n\n` +
      `Detetives: ${names}\n\n` +
      `🎲 Distribuindo cartas e montando o envelope do caso...`
  );

  // Sorteia o envelope secreto e distribui o resto das cartas entre os jogadores
  const { envelope, hands } = dealGame(game.players);
  game.envelope = envelope; // guardado apenas no servidor; nunca é enviado ao grupo
  game.hands = hands;

  const failedToNotify = [];

  for (const player of game.players) {
    const hand = hands.get(player.id) ?? [];
    const cardList = hand.map((c) => `${cardLabel(c)}`).join("\n");
    try {
      // Mensagem efêmera: aparece no próprio grupo, mas só esse jogador vê.
      await sendEphemeral(
        ctx.api,
        chatId,
        player.id,
        `🔐 suas cartas — caso ${game.caseId}\n\n${cardList}\n\n` +
          `Só você está vendo isso. Bom trabalho, detetive.`
      );
    } catch (err) {
      console.error(`Falha ao enviar mensagem efêmera para ${player.name}:`, err);
      failedToNotify.push(player.name);
    }
  }

  if (failedToNotify.length > 0) {
    await ctx.api.sendMessage(
      chatId,
      `⚠️ Não consegui mostrar as cartas em segredo para: ${failedToNotify.join(", ")}.\n` +
        `Isso pode acontecer se o servidor do Bot API ainda não suportar mensagens efêmeras — ` +
        `nesse caso, verifique a versão do Bot API em uso.`
    );
  } else {
    await ctx.api.sendMessage(chatId, `✅ Cartas distribuídas — cada um só vê a própria mão.`);
  }

  // TODO próximo módulo: turnos (mover, investigar, sugerir) usando game.envelope e game.hands
});

bot.catch((err) => {
  console.error("Erro no bot:", err);
});

bot.start();
console.log("Bot rodando. Use /newgame em um grupo pra criar uma partida.");
