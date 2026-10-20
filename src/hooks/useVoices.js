import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getCookie } from '../utils/cookies';

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
        // A voice the backend lists but the bridge does not serve would only fail,
        // so it is left out of the picker.
        voicesCache = served ? offered.filter(v => served.has(v.key)) : offered;
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
  if (saved && voices.some(v => v.key === saved)) return saved;
  return voices.find(v => v.defaultVoice)?.key || '';
}

// What the voice pickers show for a voice, marking the backend's default one.
export function voiceLabel(voice) {
  return voice.defaultVoice ? `${voice.name} (default)` : voice.name;
}

export function useVoices() {
  const [voices, setVoices] = useState(() => voicesCache || []);
  const [loading, setLoading] = useState(!voicesCache);

  useEffect(() => {
    if (voicesCache) return;
    let active = true;
    loadVoices()
      .then(list => { if (active) setVoices(list); })
      .catch(err => console.warn('[useVoices] Failed to load voices:', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { voices, loading };
}
