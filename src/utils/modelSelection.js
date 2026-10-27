// Voices the backend lists but will not voice with: announced ones and retired ones.
export const VOICE_STATUS = { AVAILABLE: 'AVAILABLE', COMING_SOON: 'COMING_SOON', RETIRED: 'RETIRED' };

// A voice without a status comes from a backend that predates statuses, and was usable.
export function isAvailable(model) {
  return !!model && (!model.status || model.status === VOICE_STATUS.AVAILABLE);
}

// The API currently permits only the default model for signed-out users.
export function canSelectModel(model, isGuest) {
  return isAvailable(model) && (!isGuest || model.defaultVoice === true);
}

export function selectedModelKey(models, requestedKey, isGuest, preferredKey = '') {
  const defaultKey = models.find(model => model.defaultVoice && isAvailable(model))?.key || '';
  if (isGuest) return defaultKey;
  return [requestedKey, preferredKey].find(key => key && models.some(model => model.key === key && isAvailable(model))) || defaultKey;
}
