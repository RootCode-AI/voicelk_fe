import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getCookie } from '../utils/cookies';
import { isAvailable, VOICE_STATUS } from '../utils/modelSelection';

// Cookie holding the voice the user picked in Settings.
export const VOICE_COOKIE = 'vlk_voice_model';

// The voice list changes only when the backend's configuration does, so it is
// fetched once and shared by every component for the app's lifetime.
let voicesCache = null;
let voicesRequest = null;

// Keys of the models the bridge can serve right now, or null when that is unknown
// (bridge down or unreachable) — then no voice is hidden on its account.
function loadServedModels() {
  return api.get('/api/tts/models')
    .then(data => Array.isArray(data?.models) ? new Set(data.models.map(m => m.key)) : null)
    .catch(() => null);
}

export function loadVoices() {
  if (voicesCache) return Promise.resolve(voicesCache);
  if (!voicesRequest) {
    voicesRequest = Promise.all([api.get('/api/tts/voices'), loadServedModels()])
      .then(([data, served]) => {
        const offered = Array.isArray(data) ? data : [];
        // A voice the backend offers but the bridge does not serve would only fail,
        // so it is left out of the picker. Coming-soon and retired voices are never
        // served; they stay in the list so users are told about them.
        voicesCache = served ? offered.filter(v => !isAvailable(v) || served.has(v.key)) : offered;
        return voicesCache;
      })
      .finally(() => { voicesRequest = null; });
  }
  return voicesRequest;
}

// The saved voice when the backend still offers it, otherwise its default voice.
// An empty string sends no voice at all, which leaves the choice to the backend.
export function preferredVoice(voices) {
  const saved = getCookie(VOICE_COOKIE);
  if (saved && voices.some(v => v.key === saved && isAvailable(v))) return saved;
  return voices.find(v => v.defaultVoice && isAvailable(v))?.key || '';
}

// The retired voice the user had saved, so the UI can say why it was switched.
export function retiredSavedVoice(voices) {
  const saved = getCookie(VOICE_COOKIE);
  return saved ? voices.find(v => v.key === saved && v.status === VOICE_STATUS.RETIRED) || null : null;
}

// What the voice pickers show for a voice: its tag, its status, and the default mark.
export function voiceLabel(voice) {
  const name = voice.name || voice.key;
  if (voice.status === VOICE_STATUS.COMING_SOON) return `${name} (coming soon)`;
  if (voice.status === VOICE_STATUS.RETIRED) return `${name} (no longer supported)`;
  const tagged = voice.tag ? `${name} · ${voice.tag}` : name;
  return voice.defaultVoice ? `${tagged} (default)` : tagged;
}

export function useVoices() {
  const [voices, setVoices] = useState(() => voicesCache || []);
  const [loading, setLoading] = useState(!voicesCache);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    if (voicesCache) {
      setVoices(voicesCache);
      setError(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    loadVoices()
      .then(list => { if (active) setVoices(list); })
      .catch(err => {
        console.warn('[useVoices] Failed to load voices:', err);
        if (active) setError('Models could not be loaded. Please try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  return { voices, loading, error, retry };
}
