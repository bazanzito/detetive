// lobby.js
// Gerencia o estado de "sala de espera" de cada partida (uma por grupo do Telegram).
// Isso é só a fase de lobby: criar partida, entrar, sair, ver regras, iniciar.
// A lógica do jogo em si (cartas, turnos, acusações) entra depois, como um
// próximo módulo que recebe a lista final de jogadores daqui.

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

// casos possíveis só pra dar sabor ao lobby (número + nome do "caso")
const CASE_NAMES = [
  "Blackwood Mansion",
  "Hotel Abandonado",
  "Mansão Ravenscroft",
  "Vila Enevoada",
  "Torre do Relógio",
  "Estação Central",
];

/**
 * @typedef {Object} Player
 * @property {number} id - Telegram user id
 * @property {string} name - nome de exibição
 */

/**
 * @typedef {Object} Game
 * @property {string} caseId
 * @property {string} caseName
 * @property {number} hostId
 * @property {Player[]} players
 * @property {"lobby"|"started"} status
 * @property {number} messageId - mensagem do lobby, pra poder editar em vez de reenviar
 */

export class LobbyManager {
  constructor() {
    /** @type {Map<number, Game>} chatId -> Game */
    this.games = new Map();
  }

  hasGame(chatId) {
    return this.games.has(chatId);
  }

  getGame(chatId) {
    return this.games.get(chatId);
  }

  createGame(chatId, host) {
    const caseNumber = Math.floor(1000 + Math.random() * 9000);
    const caseName = CASE_NAMES[Math.floor(Math.random() * CASE_NAMES.length)];

    /** @type {Game} */
    const game = {
      caseId: `#${caseNumber}`,
      caseName,
      hostId: host.id,
      players: [{ id: host.id, name: host.name }],
      status: "lobby",
      messageId: null,
    };

    this.games.set(chatId, game);
    return game;
  }

  addPlayer(chatId, player) {
    const game = this.games.get(chatId);
    if (!game) return { ok: false, reason: "no_game" };
    if (game.status !== "lobby") return { ok: false, reason: "already_started" };
    if (game.players.some((p) => p.id === player.id)) {
      return { ok: false, reason: "already_joined" };
    }
    if (game.players.length >= MAX_PLAYERS) {
      return { ok: false, reason: "full" };
    }
    game.players.push(player);
    return { ok: true, game };
  }

  removePlayer(chatId, playerId) {
    const game = this.games.get(chatId);
    if (!game) return { ok: false, reason: "no_game" };
    game.players = game.players.filter((p) => p.id !== playerId);
    return { ok: true, game };
  }

  canStart(game) {
    return game.players.length >= MIN_PLAYERS && game.status === "lobby";
  }

  startGame(chatId, requesterId) {
    const game = this.games.get(chatId);
    if (!game) return { ok: false, reason: "no_game" };
    if (game.hostId !== requesterId) return { ok: false, reason: "not_host" };
    if (!this.canStart(game)) return { ok: false, reason: "not_enough_players" };
    game.status = "started";
    return { ok: true, game };
  }

  endGame(chatId) {
    this.games.delete(chatId);
  }
}

export { MIN_PLAYERS, MAX_PLAYERS };
