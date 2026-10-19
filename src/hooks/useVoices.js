import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getCookie } from '../utils/cookies';

// Cookie holding the voice the user picked in Settings.
export const VOICE_COOKIE = 'vlk_voice_model';

// The voice list changes only when the backend's configuration does, so it is
// fetched once and shared by every component for the app's lifetime.
let voicesCache = null;
let voicesRequest = null;

export function loadVoices() {
  if (voicesCache) return Promise.resolve(voicesCache);
  if (!voicesRequest) {
    voicesRequest = api.get('/api/tts/voices')
      .then(data => {
        voicesCache = Array.isArray(data) ? data : [];
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
