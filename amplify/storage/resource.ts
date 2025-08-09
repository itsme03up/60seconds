// amplify/storage/resource.ts
import { defineStorage } from "@aws-amplify/backend";

export const slidesStorage = defineStorage({
  name: "slidesStorage",
  isDefault: true,
  access: (allow) => ({
    // まずはゲストでも read/write を許可（プロトタイプ用）
    // 本番では allow.entity('identity') 等に置き換え推奨
    "decks/{deckId}/*": [
      allow.guest.to(["read", "write"]),
      allow.authenticated.to(["read", "write"])
    ]
  })
});
