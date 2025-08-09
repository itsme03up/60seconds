// src/lib/cloudStorage.js
import { uploadData, downloadData, list, remove } from "aws-amplify/storage";

export function newDeckId() {
  return (crypto?.randomUUID?.() || String(Date.now()));
}

// Amplifyが設定されているかチェック
function isAmplifyConfigured() {
  try {
    // Amplifyが正しく設定されているかを簡単にチェック
    return window?.AWS?.config || false;
  } catch (error) {
    return false;
  }
}

/** deckJson 例:
 * {
 *   title: "1分スピーチ",
 *   totalSec: 60,
 *   sections: [
 *     { key: "point",   text: "...", link: "https://..." },
 *     { key: "reason",  text: "...", link: "https://..." },
 *     { key: "example", text: "...", link: "https://..." },
 *     { key: "summary", text: "...", link: "https://..." }
 *   ]
 * }
 */

const BUCKET = "slidesStorage";

export async function saveDeck(deckId, deckJson) {
  try {
    const base = `decks/${deckId}`;
    await uploadData({
      path: `${base}/deck.json`,
      data: JSON.stringify(deckJson),
      options: { contentType: "application/json", bucket: BUCKET }
    }).result;
    return deckId;
  } catch (error) {
    if (error.message?.includes('Auth') || error.message?.includes('amplify')) {
      throw new Error('Amplifyが設定されていません。まずAmplifyバックエンドをデプロイしてください。');
    }
    throw error;
  }
}

export async function loadDeck(deckId) {
  try {
    const res = await downloadData({
      path: `decks/${deckId}/deck.json`,
      options: { bucket: BUCKET }
    }).result;
    const text = await res.body.text();
    return JSON.parse(text);
  } catch (error) {
    if (error.message?.includes('Auth') || error.message?.includes('amplify')) {
      throw new Error('Amplifyが設定されていません。まずAmplifyバックエンドをデプロイしてください。');
    }
    throw error;
  }
}

/** deck 一覧: deck.json のあるフォルダを抽出 */
export async function listDecks() {
  try {
    const { items } = await list({ path: "decks/", options: { bucket: BUCKET } });
    return items
      .filter(it => it.path.endsWith("/deck.json"))
      .map(it => {
        const parts = it.path.split("/");
        return { id: parts[1], path: it.path, lastModified: it.lastModified };
      })
      .sort((a, b) => (b.lastModified?.valueOf?.() || 0) - (a.lastModified?.valueOf?.() || 0));
  } catch (error) {
    if (error.message?.includes('Auth') || error.message?.includes('amplify')) {
      throw new Error('Amplifyが設定されていません。まずAmplifyバックエンドをデプロイしてください。');
    }
    throw error;
  }
}

export async function deleteDeck(deckId) {
  try {
    // 必要最低限：manifestだけ削除（完全削除するなら list→remove で配下を全削除）
    await remove({ path: `decks/${deckId}/deck.json`, options: { bucket: BUCKET } });
  } catch (error) {
    if (error.message?.includes('Auth') || error.message?.includes('amplify')) {
      throw new Error('Amplifyが設定されていません。まずAmplifyバックエンドをデプロイしてください。');
    }
    throw error;
  }
}
