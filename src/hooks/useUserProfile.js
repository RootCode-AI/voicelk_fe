import { useState, useEffect } from 'react';
import { api, friendlyMessage } from '../services/api';

// Shared across every component instance for the app's lifetime, so
// switching tabs or remounting the Profile page never re-fetches a user
// whose details are already known.
const profileCache = new Map();

function mapProfile(data) {
  return {
    fullName: data.userName || data.email?.split('@')[0] || '',
    email: data.email || '',
    avatar: data.profilePicture || '',
  };
}

export function useUserProfile(userId, showError) {
  const [profile, setProfile] = useState(() => profileCache.get(userId) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const cached = profileCache.get(userId);
    if (cached) {
      setProfile(cached);
      return;
    }

    setLoading(true);
    api.get(`/api/reg/${userId}`)
      .then(data => {
        if (!data) return;
        const mapped = mapProfile(data);
        profileCache.set(userId, mapped);
        setProfile(mapped);
      })
      .catch(err => {
        console.error('[useUserProfile] Failed to fetch user profile:', err);
        showError?.(friendlyMessage(err), 'error');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { profile, loading };
}
