import { useState } from 'react';
import { useVoices, preferredVoice } from './useVoices';
import { canSelectModel, selectedModelKey } from '../utils/modelSelection';

export function useModelSelection(userData, initialModel = '') {
  const { voices, loading, error, retry } = useVoices();
  const [requestedModel, setRequestedModel] = useState(initialModel);
  const isGuest = !userData || userData.role === 'GUEST';
  const model = selectedModelKey(voices, requestedModel, isGuest, preferredVoice(voices));
  const selectModel = key => {
    if (canSelectModel(voices.find(voice => voice.key === key), isGuest)) setRequestedModel(key);
  };
  return { voices, loading, error, retry, isGuest, model, requestedModel, selectModel };
}
