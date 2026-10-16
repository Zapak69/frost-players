(function () {
  const NAME_RE = /^[A-Za-z0-9_]{1,16}$/;
  const ID_RE = /^\d{15,21}$/;

  const LOCAL = window.location.protocol === 'file:';
  const PLAYER_PAGE = LOCAL ? 'player.html' : 'player';
  const RESERVED = ['player', 'index', 'settings', '404'];

  function prettyPath(value) {
    const q = String(value || '').trim();
    if (!NAME_RE.test(q) && !ID_RE.test(q)) return null;
    if (LOCAL || RESERVED.indexOf(q.toLowerCase()) !== -1) return PLAYER_PAGE + (ID_RE.test(q) ? '?id=' : '?nick=') + encodeURIComponent(q);
    return '/' + encodeURIComponent(q);
  }

  function playerUrl(value) {
    return prettyPath(value);
  }

  function bindSearch(form) {
    const input = form.querySelector('input');
    const error = form.parentElement.querySelector('.search-error');
    const go = function () {
      const url = playerUrl(input.value);
      if (!url) {
        if (error) error.textContent = input.value.trim() ? 'Enter a Minecraft username (letters, numbers and _) or a Discord ID.' : 'Type a Minecraft username or a Discord ID.';
        input.focus();
        return;
      }
      if (error) error.textContent = '';
      window.location.href = url;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      go();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.isComposing) return;
      e.preventDefault();
      go();
    });
    input.addEventListener('input', function () {
        if (error) error.textContent = '';
    });
  }

  document.querySelectorAll('form.search').forEach(bindSearch);
  window.FrostPlayers = { playerUrl: playerUrl, prettyPath: prettyPath, bindSearch: bindSearch, playerPage: PLAYER_PAGE, reserved: RESERVED };
})();
