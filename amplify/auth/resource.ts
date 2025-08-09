// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend";

// まずはメールログインだけ有効（UIでログインを出さなくてもOK）
export const auth = defineAuth({
  loginWith: { email: true },
  // ※ これで User Pool + Identity Pool が作成され、
  //    Storage の guest / authenticated アクセスが有効になります
});
