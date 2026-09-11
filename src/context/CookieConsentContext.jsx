import { createContext, useContext, useState, useCallback } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

const CONSENT_COOKIE = 'vlk_cookie_consent';

// Preference cookies that require consent before they can be written.
export const PREFERENCE_COOKIES = ['vlk_theme', 'vlk_language', 'vlk_playback_speed', 'vlk_autoplay'];

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  // 'granted' | 'denied' | null (not yet decided)
  const [consent, setConsent] = useState(() => getCookie(CONSENT_COOKIE));

  const acceptCookies = useCallback(() => {
    setCookie(CONSENT_COOKIE, 'granted', 365);
    setConsent('granted');
  }, []);

  const declineCookies = useCallback(() => {
    setCookie(CONSENT_COOKIE, 'denied', 365);
    PREFERENCE_COOKIES.forEach(deleteCookie);
    setConsent('denied');
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{ consent, hasConsent: consent === 'granted', acceptCookies, declineCookies }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used inside <CookieConsentProvider>');
  return ctx;
}
