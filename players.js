(function () {
  const NAME_RE = /^[A-Za-z0-9_]{1,16}$/;
  const ID_RE = /^\d{15,21}$/;

  function playerUrl(value) {
    const q = String(value || '').trim();
    if (ID_RE.test(q)) return 'player?id=' + encodeURIComponent(q);
    if (NAME_RE.test(q)) return 'player?nick=' + encodeURIComponent(q);
    return null;
  }

  function bindSearch(form) {
    const input = form.querySelector('input');
    const error = form.parentElement.querySelector('.search-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const url = playerUrl(input.value);
      if (!url) {
        if (error) error.textContent = input.value.trim() ? 'Enter a Minecraft username (letters, numbers and _) or a Discord ID.' : 'Type a Minecraft username or a Discord ID.';
        input.focus();
        return;
      }
      if (error) error.textContent = '';
      window.location.href = url;
    });
    input.addEventListener('input', function () {
        if (error) error.textContent = '';
    });
  }

  document.querySelectorAll('form.search').forEach(bindSearch);
  window.FrostPlayers = { playerUrl: playerUrl, bindSearch: bindSearch };
})();
