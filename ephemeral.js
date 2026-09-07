// ephemeral.js
// Wrapper fino em cima do recurso de Ephemeral Messages do Bot API (10.2+).
// Manda uma mensagem dentro do próprio chat (grupo ou privado) que só o
// usuário-alvo consegue ver — sem precisar de conversa privada prévia com o bot.
//
// Requer uma versão do Bot API >= 10.2 no servidor (api.telegram.org já
// suporta desde 14/07/2026). Bibliotecas de bot mais antigas podem não ter
// esse parâmetro tipado, mas como é só um objeto JS sendo serializado pra
// JSON, passar o campo extra funciona de qualquer forma.

/**
 * Envia uma mensagem visível apenas para um jogador específico, dentro do chat.
 * @param {import("grammy").Api} api
 * @param {number} chatId
 * @param {number} receiverUserId - quem pode ver a mensagem
 * @param {string} text
 * @param {object} [extra] - reply_markup, parse_mode, etc.
 * @returns {Promise<import("grammy/types").Message>}
 */
export async function sendEphemeral(api, chatId, receiverUserId, text, extra = {}) {
  return api.sendMessage(chatId, text, {
    ...extra,
    ephemeral_message_parameters: { receiver_user_id: receiverUserId },
  });
}

/**
 * Variante para responder a um callback_query com uma mensagem efêmera no
 * lugar da mensagem original (em vez de só um alerta popup).
 */
export async function sendEphemeralReplacingCallback(api, chatId, callbackQueryId, text, extra = {}) {
  return api.sendMessage(chatId, text, {
    ...extra,
    ephemeral_message_parameters: {
      callback_query_id: callbackQueryId,
      replace_callback_query_message: true,
    },
  });
}

export async function editEphemeralText(api, chatId, ephemeralMessageId, text, extra = {}) {
  return api.raw.editEphemeralMessageText({
    chat_id: chatId,
    ephemeral_message_id: ephemeralMessageId,
    text,
    ...extra,
  });
}

export async function deleteEphemeral(api, chatId, ephemeralMessageId) {
  return api.raw.deleteEphemeralMessage({
    chat_id: chatId,
    ephemeral_message_id: ephemeralMessageId,
  });
}
