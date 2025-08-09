import { defineBackend } from '@aws-amplify/backend';
import { slidesStorage } from './storage/resource';
import { auth } from './auth/resource';

const backend = defineBackend({
  storage: slidesStorage,
  auth, // ← これを追加
});
