import api from './api';

// ──────────────────────────────────────────────────────────────────
// Google Sign-In (Google Identity Services) - Simplified for Debugging
// ──────────────────────────────────────────────────────────────────

let currentLoadedLanguage = null;

/**
 * Dynamically loads the Google Identity Services script with host language parameter (hl).
 * Returns a promise that resolves when the script is ready.
 */
export function loadGoogleScript(lang = 'tr') {
  const langCode = (lang || 'tr').slice(0, 2).toLowerCase();

  return new Promise((resolve, reject) => {
    const scriptId = 'google-gsi-client-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript && currentLoadedLanguage === langCode && window.google?.accounts?.id) {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.remove();
    }

    currentLoadedLanguage = langCode;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://accounts.google.com/gsi/client?hl=${langCode}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Simplified Google Auth Initialization for Isolation Testing
 */
export function initGoogleAuth(targetElementId, callbacks = {}, options = {}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1058043134555-n4q6pioq7ui2i0gjlt8tqlttgq363apd.apps.googleusercontent.com';
  const locale = (options.locale || 'tr').slice(0, 2).toLowerCase();

  return loadGoogleScript(locale).then(() => {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    // Google SDK simple initialization
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (callbacks.onSuccess) {
          callbacks.onSuccess(response.credential);
        } else {
          handleOAuthLogin('google', response.credential);
        }
      },
      auto_select: false,
      use_fedcm: false
    });

    // Render default Google button
    targetElement.innerHTML = '';
    window.google.accounts.id.renderButton(
      targetElement,
      { theme: "outline", size: "large", locale: locale }
    );
  }).catch((err) => {
    if (callbacks.onError) {
      callbacks.onError(err);
    }
  });
}

/**
 * Initiates Google Sign-In and returns the credential (ID token).
 */
export function signInWithGoogle(options = {}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1058043134555-n4q6pioq7ui2i0gjlt8tqlttgq363apd.apps.googleusercontent.com';
  const locale = typeof options === 'string' ? options.slice(0, 2).toLowerCase() : (options.locale || 'tr').slice(0, 2).toLowerCase();

  return loadGoogleScript(locale).then(() => {
    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response && response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('Google Sign-In failed: No credential received'));
          }
        },
        auto_select: false,
        use_fedcm: false
      });

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      try {
        window.google.accounts.id.renderButton(tempDiv, {
          theme: 'outline',
          size: 'large',
          locale: locale
        });

        const btn = tempDiv.querySelector('[role="button"]') || tempDiv.querySelector('div[id^="g_"]');
        if (btn) {
          btn.click();
        } else {
          document.body.removeChild(tempDiv);
          reject(new Error('Google Sign-In button could not be rendered/clicked'));
        }
      } catch (err) {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        reject(err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 30000);
      }
    });
  });
}

// ──────────────────────────────────────────────────────────────────
// Backend OAuth Login
// ──────────────────────────────────────────────────────────────────

/**
 * Sends the Google OAuth ID token to the backend for verification and login.
 * On success, stores the JWT token and user info in localStorage.
 *
 * Supports both handleOAuthLogin(credential) and handleOAuthLogin('google', credential)
 */
export async function handleOAuthLogin(providerOrToken, tokenIfTwoArgs, rememberMe = false) {
  let provider = 'google';
  let idToken = providerOrToken;
  let remember = false;
  if (tokenIfTwoArgs && typeof tokenIfTwoArgs === 'string') {
    provider = providerOrToken;
    idToken = tokenIfTwoArgs;
    remember = rememberMe;
  } else if (tokenIfTwoArgs && typeof tokenIfTwoArgs === 'boolean') {
    idToken = providerOrToken;
    remember = tokenIfTwoArgs;
  }

  // Prevent backend call if token is missing or invalid
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    throw new Error('Token alımı başarısız: Geçerli bir Google token bulunamadı.');
  }

  const response = await api.post(
    '/api/auth/oauth-login',
    {
      provider,
      idToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    }
  );

  const data = response.data;

  // 3. DÖNEN TOKEN'I SAKLAMA:
  // Store JWT token & user object in localStorage/sessionStorage / auth state
  if (data && data.token) {
    const storage = remember ? localStorage : sessionStorage;

    // Clean up both stores first
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');

    storage.setItem('token', data.token);
    if (data.user) {
      storage.setItem('user', JSON.stringify(data.user));
      storage.setItem('userId', data.user.email || '');
    }
  }

  return data;
}
