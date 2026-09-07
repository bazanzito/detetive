// cards.js
// Catálogo de cartas do jogo. Nomes originais (não usamos os personagens
// clássicos de Cluedo pra evitar qualquer problema de marca registrada).

export const SUSPECTS = [
  { id: "duqueiro", name: "Dra. Ravenna Duqueiro", emoji: "🔬" },
  { id: "ferraz", name: "Coronel Ferraz", emoji: "🎖️" },
  { id: "iolanda", name: "Madame Iolanda", emoji: "💄" },
  { id: "bittencourt", name: "Sr. Bittencourt", emoji: "🎩" },
  { id: "alvim", name: "Srta. Alvim", emoji: "🌂" },
  { id: "cinza", name: "Major Cinza", emoji: "🪖" },
];

export const LOCATIONS = [
  { id: "biblioteca", name: "Biblioteca", emoji: "📚" },
  { id: "salao", name: "Salão de Festas", emoji: "🕺" },
  { id: "cozinha", name: "Cozinha", emoji: "🍽️" },
  { id: "escritorio", name: "Escritório", emoji: "🗄️" },
  { id: "jardim_inverno", name: "Jardim de Inverno", emoji: "🌿" },
  { id: "adega", name: "Adega", emoji: "🍷" },
];

export const WEAPONS = [
  { id: "corda", name: "Corda", emoji: "🪢" },
  { id: "castical", name: "Castiçal", emoji: "🕯️" },
  { id: "punhal", name: "Punhal", emoji: "🗡️" },
  { id: "chave_inglesa", name: "Chave Inglesa", emoji: "🔧" },
  { id: "revolver", name: "Revólver", emoji: "🔫" },
  { id: "cano_chumbo", name: "Cano de Chumbo", emoji: "🪠" },
];

/** @typedef {{ id: string, name: string, emoji: string, type: "suspect"|"location"|"weapon" }} Card */

/** @returns {Card[]} */
export function allCards() {
  return [
    ...SUSPECTS.map((c) => ({ ...c, type: "suspect" })),
    ...LOCATIONS.map((c) => ({ ...c, type: "location" })),
    ...WEAPONS.map((c) => ({ ...c, type: "weapon" })),
  ];
}

export function cardLabel(card) {
  return `${card.emoji} ${card.name}`;
}

export function findCard(id) {
  return allCards().find((c) => c.id === id);
}
