import api from './api';

// ──────────────────────────────────────────────────────────────────
// Google Sign-In (Google Identity Services) - Simplified for Debugging
// ──────────────────────────────────────────────────────────────────

let googleScriptLoaded = false;
let googleScriptLoading = false;

/**
 * Dynamically loads the Google Identity Services script.
 * Returns a promise that resolves when the script is ready.
 */
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (googleScriptLoaded && window.google?.accounts?.id) {
      resolve();
      return;
    }

    if (googleScriptLoading) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          googleScriptLoaded = true;
          resolve();
        }
      }, 100);
      return;
    }

    googleScriptLoading = true;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleScriptLoaded = true;
      googleScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      googleScriptLoading = false;
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Simplified Google Auth Initialization for Isolation Testing
 */
export function initGoogleAuth(targetElementId, callbacks = {}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1058043134555-n4q6pioq7ui2i0gjlt8tqlttgq363apd.apps.googleusercontent.com';

  // Debug logs requested for origin & client id inspection
  console.log('[DEBUG] window.location.origin:', window.location.origin);
  console.log('[DEBUG] import.meta.env.VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
  console.log('[DEBUG] Effective Google Client ID:', clientId);

  return loadGoogleScript().then(() => {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      console.error(`[DEBUG] Element with id "${targetElementId}" not found in DOM.`);
      return;
    }

    // Google SDK simple initialization
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        console.log("Google ID Token Başarıyla Alındı:", response.credential);
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
      { theme: "outline", size: "large" }
    );
  }).catch((err) => {
    console.error('[DEBUG] Failed to initialize Google Auth:', err);
    if (callbacks.onError) {
      callbacks.onError(err);
    }
  });
}

/**
 * Initiates Google Sign-In and returns the credential (ID token).
 */
export function signInWithGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1058043134555-n4q6pioq7ui2i0gjlt8tqlttgq363apd.apps.googleusercontent.com';

  console.log('[DEBUG] window.location.origin:', window.location.origin);
  console.log('[DEBUG] import.meta.env.VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return loadGoogleScript().then(() => {
    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response && response.credential) {
            console.log("Google ID Token Başarıyla Alındı:", response.credential);
            resolve(response.credential);
          } else {
            console.error('[OAuth] Google Sign-In response does not contain credential:', response);
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
          size: 'large'
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
export async function handleOAuthLogin(providerOrToken, tokenIfTwoArgs) {
  let provider = 'google';
  let idToken = providerOrToken;
  if (tokenIfTwoArgs) {
    provider = providerOrToken;
    idToken = tokenIfTwoArgs;
  }

  // Prevent backend call if token is missing or invalid
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    console.error('[OAuth] Aborting backend request: ID token is invalid or empty.');
    throw new Error('Token alımı başarısız: Geçerli bir Google token bulunamadı.');
  }

  console.log('[OAuth] Sending ID token to backend /api/auth/oauth-login...');
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
  // Store JWT token & user object in localStorage / auth state
  if (data && data.token) {
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user.email || '');
    }
  }

  return data;
}
