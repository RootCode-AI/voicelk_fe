// The API currently permits only the default model for signed-out users.
export function canSelectModel(model, isGuest) {
  return !!model && (!isGuest || model.defaultVoice === true);
}

export function selectedModelKey(models, requestedKey, isGuest, preferredKey = '') {
  const defaultKey = models.find(model => model.defaultVoice)?.key || '';
  if (isGuest) return defaultKey;
  return [requestedKey, preferredKey].find(key => key && models.some(model => model.key === key)) || defaultKey;
}
