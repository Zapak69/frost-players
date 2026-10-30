(function () {
  const TOKEN_KEY = 'frostPlayersToken';
  const PRIVACY_URL = 'https://bot.frostclient.eu/site/privacy';
  const FRIENDS_URL = 'https://bot.frostclient.eu/site/friends';
  const MAIN_LOGIN = 'https://frostclient.eu/?players_login=';
  const SAFE_PATH = /^\/(?!\/)[A-Za-z0-9_\/?=&%.-]*$/;
  const HANDOFF_KEY = 'frostPlayersHandoff';
  let privacyPromise = null;
  let friendsPromise = null;

  function loadToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
        return '';
    }
  }

  function saveToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {}
  }

  function clearToken() {
    privacyPromise = null;
    friendsPromise = null;
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  function newHandoffNonce() {
    try {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      const nonce = Array.from(buf).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      sessionStorage.setItem(HANDOFF_KEY, nonce);
      return nonce;
    } catch (e) {
      return '';
    }
  }

  function takeHandoffNonce() {
    try {
      const nonce = sessionStorage.getItem(HANDOFF_KEY) || '';
      sessionStorage.removeItem(HANDOFF_KEY);
      return nonce;
    } catch (e) {
      return '';
    }
  }

  function consumeHandoff() {
    const hash = window.location.hash;
    if (hash.indexOf('#login=') !== 0) return;
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('login') || '';
    const target = params.get('r') || '/';
    const nonce = params.get('n') || '';
    const expected = takeHandoffNonce();
    const clean = SAFE_PATH.test(target) ? target : '/';
    history.replaceState(null, '', window.location.pathname + window.location.search);
    const fresh = token && !nonce ? newHandoffNonce() : '';
    if (fresh) {
      window.location.href = MAIN_LOGIN + encodeURIComponent(clean) + '&n=' + fresh;
      return;
    }
    if (token && expected && nonce === expected) saveToken(token);
    if (clean !== window.location.pathname + window.location.search) window.location.replace(clean);
    else history.replaceState(null, '', clean);
  }

  function login(path) {
    const target = SAFE_PATH.test(path || '') ? path : window.location.pathname + window.location.search;
    const nonce = newHandoffNonce();
    window.location.href = MAIN_LOGIN + encodeURIComponent(target) + (nonce ? '&n=' + nonce : '');
  }

  function logout() {
    clearToken();
    window.location.href = '/';
  }

  function postPrivacy(body) {
    return fetch(PRIVACY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    }).then(function (r) {
        return r.json();
    }).then(function (res) {
      if (res && res.error === 'token_expired') {
        clearToken();
        renderNav(null);
        const err = new Error('token_expired');
        err.expired = true;
        throw err;
      }
      if (!res || !res.ok) {
        const err = new Error((res && res.error) || 'failed');
        err.field = res && res.field;
        throw err;
      }
      return res;
    });
  }

  function getPrivacy(force) {
    const token = loadToken();
    if (!token) return Promise.resolve(null);
    if (!privacyPromise || force) privacyPromise = postPrivacy({ token: token }).catch(function (err) {
      privacyPromise = null;
      throw err;
    });
    return privacyPromise;
  }

  function savePrivacy(patch) {
    const token = loadToken();
    if (!token) return Promise.reject(new Error('signed_out'));
    privacyPromise = postPrivacy({ token: token, settings: patch });
    return privacyPromise;
  }

  function saveSocials(socials) {
    const token = loadToken();
    if (!token) return Promise.reject(new Error('signed_out'));
    return postPrivacy({ token: token, socials: socials }).then(function (res) {
      privacyPromise = Promise.resolve(res);
      return res;
    });
  }

  function postFriends(body) {
    return fetch(FRIENDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    }).then(function (r) {
        return r.json();
    }).then(function (res) {
      if (res && res.error === 'token_expired') {
        clearToken();
        renderNav(null);
        const err = new Error('token_expired');
        err.expired = true;
        throw err;
      }
      return res || { ok: false, error: 'failed' };
    });
  }

  function getFriends(force) {
    const token = loadToken();
    if (!token) return Promise.resolve(null);
    if (!friendsPromise || force) friendsPromise = postFriends({ token: token }).catch(function (err) {
      friendsPromise = null;
      throw err;
    });
    return friendsPromise;
  }

  function friendAction(action, extra) {
    const token = loadToken();
    if (!token) return Promise.reject(new Error('signed_out'));
    return postFriends(Object.assign({ token: token, action: action }, extra || {})).then(function (res) {
      if (res && res.me) {
        friendsPromise = Promise.resolve(Object.assign({}, res, { ok: true, error: undefined }));
        document.dispatchEvent(new CustomEvent('frost-friends', { detail: res }));
      }
      return res;
    });
  }

  function renderNav(data) {
    const slot = document.getElementById('navAccount');
    if (!slot) return;
    slot.innerHTML = '';
    const link = document.createElement('a');
    link.className = 'nav-account';
    if (!loadToken()) {
      link.href = '#';
      link.textContent = 'Sign in';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        login();
      });
    } else {
      const own = data && data.accounts && data.accounts[0];
      link.href = own ? '/' + encodeURIComponent(own) : '/settings';
      link.textContent = own ? 'My profile' : 'Profile settings';
    }
    slot.appendChild(link);
  }

  consumeHandoff();
  window.FrostPlayersAuth = { loadToken: loadToken, login: login, logout: logout, getPrivacy: getPrivacy, savePrivacy: savePrivacy, saveSocials: saveSocials, getFriends: getFriends, friendAction: friendAction };
  document.addEventListener('DOMContentLoaded', function () {
    renderNav(null);
    getPrivacy().then(renderNav).catch(function () {});
  });
})();
