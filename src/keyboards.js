// keyboards.js
// Monta o texto e os botões (inline keyboard) da mensagem de lobby.

import { InlineKeyboard } from "grammy";
import { MAX_PLAYERS, MIN_PLAYERS } from "./lobby.js";

export function lobbyText(game) {
  const playerLines = game.players.map((p) => `👤 ${p.name}`).join("\n");
  return (
    `🔎 caso ${game.caseId} — ${game.caseName}\n` +
    `players: ${game.players.length}/${MAX_PLAYERS}\n\n` +
    `${playerLines}\n\n` +
    (game.players.length < MIN_PLAYERS
      ? `aguardando pelo menos ${MIN_PLAYERS} detetives...`
      : `pronto para começar quando o host quiser.`)
  );
}

export function lobbyKeyboard(game) {
  const kb = new InlineKeyboard()
    .text("✅ Entrar", "join_game")
    .text("📖 Regras", "show_rules")
    .row()
    .text("🚪 Sair", "leave_game")
    .text("▶️ Iniciar", "start_game");
  return kb;
}

export const RULES_TEXT =
  "🕵️ Como jogar\n\n" +
  "No início, o bot sorteia em segredo 1 suspeito, 1 local e 1 arma — " +
  "isso é o envelope do caso. As demais cartas são distribuídas entre os jogadores.\n\n" +
  "No seu turno você pode se mover, investigar ou fazer uma sugestão. " +
  "Uma sugestão pergunta aos outros jogadores, em ordem, se eles têm alguma " +
  "das três cartas citadas — a resposta é sempre privada.\n\n" +
  "Quem achar que resolveu o caso pode fazer uma acusação final. " +
  "Acertar todas as três cartas do envelope vence o jogo; errar tira você " +
  "da disputa (mas você continua ajudando com investigações).";
