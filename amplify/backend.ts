import { defineBackend } from '@aws-amplify/backend';
import { slidesStorage } from './storage/resource';

const backend = defineBackend({
  storage: slidesStorage,
});
