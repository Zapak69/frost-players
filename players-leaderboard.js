(function () {
  const section = document.getElementById('leaderboard');
  const list = document.getElementById('leaderboardList');
  if (!section || !list) return;
  const API = 'https://bot.frostclient.eu/players/leaderboard';
  const MEDALS = ['is-gold', 'is-silver', 'is-bronze'];
  const BOLT = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';
  const MODRINTH = '<svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><path d="m446.1 348.5 42.1 14.6C447.7 451 358.8 512 255.7 512c-85.4 0-161.1-41.9-207.6-106.3-7.7-9.9-16.7-24-22.5-37.5C11.5 339.4 2.7 307.6.3 274h44.5c2.1 25.2 8.7 49.1 18.9 71l37.5-22.5c-8.8-20.3-13.7-42.8-13.7-66.3 0-92.5 75.1-167.6 167.6-167.6 2.3 0 4.6 0 6.8.1l-7 44.1c-68 .1-123.3 55.3-123.3 123.4 0 15.2 2.8 29.8 7.8 43.3l49.1-29.5-14.9-39.4 46.6-47.9 58.9-12.7 17.1 21-27.2 27.5-23.7 7.5-16.9 17.4 8.3 23.1 16.8 17.9 23.7-6.3 16.9-18.5 36.9-11.7 11 24.7-38 46.6-63.7 20.2-28.6-31.8-49.7 29.8c22.6 25.9 55.9 42.4 93 42.4 3.5 0 6.9-.1 10.3-.4l12.3 43.1c-7.5 1-15 1.5-22.6 1.5-53.2 0-100.7-24.9-131.4-63.6l-37.5 22.5c38.6 51.5 100.2 84.9 169.5 84.9 83.8-.1 156.2-48.8 190.5-119.3M505.7 201c-2.1-10.5-5.2-21.1-9.3-32.1C460.8 70.4 366.4 0 255.7 0 123.2 0 14.1 100.9 1 230h44.6C58.5 125.4 147.7 44.3 255.7 44.3c90 0 167 56.3 197.6 135.6l-43.4 11.7c-18.9-45.3-57.2-80.5-104.4-95.4l-7 44.3c30.1 11.3 54.6 34.1 68.3 62.9 7 18.7 9.4 29.8 11.3 42 .3 3.5.5 7.1.5 10.6 0 49.2-28.9 91.7-70.5 111.5l12.3 43c60.2-25.4 102.5-85.1 102.5-154.5 0-7.5-.5-14.9-1.5-22.1l43.4-11.7c1.7 10.9 2.7 22.2 2.7 33.6 0 17.2-2.1 34.3-6.2 51l42 14.5c5.5-20.9 8.5-42.9 8.5-65.6-.1-18.6-2.2-37-6.1-54.7"/></svg>';
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
    if (p.legacyPack) {
      const modrinth = document.createElement('span');
      modrinth.className = 'leaderboard-badge leaderboard-badge--modrinth';
      modrinth.setAttribute('data-tip', 'Plays on an old modpack build');
      modrinth.setAttribute('aria-label', 'Plays on an old modpack build');
      modrinth.tabIndex = 0;
      modrinth.innerHTML = MODRINTH;
      name.appendChild(modrinth);
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
