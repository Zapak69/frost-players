(function () {
  const section = document.getElementById('leaderboard');
  const list = document.getElementById('leaderboardList');
  if (!section || !list) return;
  const API = 'https://bot.frostclient.eu/players/leaderboard';
  const MEDALS = ['is-gold', 'is-silver', 'is-bronze'];

  function hours(ms) {
    const h = ms / 3600000;
    if (h >= 100) return Math.round(h).toLocaleString('en-US') + ' h';
    if (h >= 1) return h.toFixed(1) + ' h';
    return Math.max(1, Math.round(ms / 60000)) + ' min';
  }

  function profileUrl(name) {
    return (window.FrostPlayers && window.FrostPlayers.prettyPath(name)) || ('/player?nick=' + encodeURIComponent(name));
  }

  function row(p) {
    const li = document.createElement('li');
    li.className = 'leaderboard-row' + (p.rank <= 3 ? ' is-top ' + MEDALS[p.rank - 1] : '');
    const a = document.createElement('a');
    a.href = profileUrl(p.name);
    const rank = document.createElement('span');
    rank.className = 'leaderboard-rank';
    rank.textContent = String(p.rank);
    const head = document.createElement('span');
    head.className = 'leaderboard-head-img';
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(p.name) + '/64';
    head.appendChild(img);
    if (p.online) {
      const dot = document.createElement('span');
      dot.className = 'leaderboard-online';
      dot.title = 'Online now';
      head.appendChild(dot);
    }
    const name = document.createElement('span');
    name.className = 'leaderboard-name';
    name.textContent = p.name;
    const time = document.createElement('span');
    time.className = 'leaderboard-time';
    time.textContent = hours(p.playtimeMs);
    time.title = 'Time played on FrostClient';
    a.append(rank, head, name, time);
    li.appendChild(a);
    return li;
  }

  for (let i = 0; i < 5; i++) {
    const s = document.createElement('li');
    s.className = 'leaderboard-skeleton';
    list.appendChild(s);
  }

  fetch(API, { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('http_' + r.status);
      return r.json();
    })
    .then(function (data) {
      const players = data && Array.isArray(data.players) ? data.players : [];
      if (!players.length) {
        section.hidden = true;
        return;
      }
      list.innerHTML = '';
      players.forEach(function (p) { list.appendChild(row(p)); });
    })
    .catch(function () {
      section.hidden = true;
    });
})();
