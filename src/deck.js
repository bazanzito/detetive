// deck.js
// Sorteia o envelope do caso (1 suspeito + 1 local + 1 arma) e distribui
// as cartas restantes entre os jogadores de forma equilibrada.

import { SUSPECTS, LOCATIONS, WEAPONS } from "./cards.js";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Monta o envelope (a solução secreta do caso) e o baralho com as cartas
 * restantes, já tipadas.
 */
export function buildCase() {
  const envelope = {
    suspect: { ...pickOne(SUSPECTS), type: "suspect" },
    location: { ...pickOne(LOCATIONS), type: "location" },
    weapon: { ...pickOne(WEAPONS), type: "weapon" },
  };

  const remaining = [
    ...SUSPECTS.filter((c) => c.id !== envelope.suspect.id).map((c) => ({ ...c, type: "suspect" })),
    ...LOCATIONS.filter((c) => c.id !== envelope.location.id).map((c) => ({ ...c, type: "location" })),
    ...WEAPONS.filter((c) => c.id !== envelope.weapon.id).map((c) => ({ ...c, type: "weapon" })),
  ];

  return { envelope, deck: shuffle(remaining) };
}

/**
 * Distribui o baralho o mais igualmente possível entre os jogadores.
 * @param {{id:number,name:string}[]} players
 * @param {import("./cards.js").Card[]} deck
 * @returns {Map<number, import("./cards.js").Card[]>} playerId -> mão
 */
export function dealCards(players, deck) {
  const hands = new Map(players.map((p) => [p.id, []]));
  players.forEach((p, i) => {
    deck.forEach((card, cardIndex) => {
      if (cardIndex % players.length === i) {
        hands.get(p.id).push(card);
      }
    });
  });
  return hands;
}

/**
 * Sorteia o caso completo e já distribui as cartas.
 * @param {{id:number,name:string}[]} players
 */
export function dealGame(players) {
  const { envelope, deck } = buildCase();
  const hands = dealCards(players, deck);
  return { envelope, hands };
}
