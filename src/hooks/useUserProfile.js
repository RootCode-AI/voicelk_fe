import { useState, useEffect, useCallback, useRef } from 'react';
import { api, friendlyMessage } from '../services/api';

// Profile data belongs to the mounted account workspace, never a module-level cache.
export function useUserProfile(userId, showError) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeUser = useRef(null);

  useEffect(() => {
    let active = true;
    activeUser.current = userId;
    setProfile(null);
    if (!userId) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    api.get(`/api/reg/${userId}`, { signal: controller.signal })
      .then(data => {
        if (!active || !data) return;
        setProfile({ fullName: data.userName || data.email?.split('@')[0] || '',
          email: data.email || '', avatar: data.profilePicture || '' });
      })
      .catch(err => {
        if (!active || err.name === 'AbortError') return;
        showError?.(friendlyMessage(err), 'error');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; activeUser.current = null; controller.abort(); };
  }, [userId]);

  const updateProfile = useCallback(patch => {
    if (!userId || activeUser.current !== userId) return;
    setProfile(prev => ({ ...prev, ...patch }));
  }, [userId]);

  return { profile, loading, updateProfile };
}
