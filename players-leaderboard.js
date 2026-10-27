(function () {
  const section = document.getElementById('leaderboard');
  const list = document.getElementById('leaderboardList');
  if (!section || !list) return;
  const API = 'https://bot.frostclient.eu/players/leaderboard';
  const MEDALS = ['is-gold', 'is-silver', 'is-bronze'];
  const BOLT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';
  const DISCORD = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>';

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
    const nameText = document.createElement('span');
    nameText.className = 'leaderboard-name-text';
    nameText.textContent = p.name;
    name.appendChild(nameText);
    if (p.lite) {
      const lite = document.createElement('span');
      lite.className = 'leaderboard-badge leaderboard-badge--lite';
      lite.setAttribute('data-tip', 'FrostClient Lite');
      lite.setAttribute('aria-label', 'FrostClient Lite');
      lite.innerHTML = BOLT;
      name.appendChild(lite);
    }
    if (p.discord && p.discord.username) {
      const discord = document.createElement('span');
      discord.className = 'leaderboard-badge leaderboard-badge--discord';
      discord.setAttribute('data-tip', '@' + p.discord.username);
      discord.setAttribute('aria-label', 'Discord: ' + p.discord.username);
      discord.tabIndex = 0;
      discord.innerHTML = DISCORD;
      name.appendChild(discord);
    }
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
