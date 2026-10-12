(function () {
  const API = 'https://bot.frostclient.eu/players/profile';
  const CAPES_BASE = 'https://bot.frostclient.eu/launcher/capes/';
  const STORE_CAPE = 'https://store.frostclient.eu/cape?id=';
  const DEFAULT_CAPE = { id: 'default', name: 'Default', file: 'default.png', animated: false, mature: false };
  const ANIM_W = 512;
  const ANIM_H = 256;
  const ANIM_MAX_FRAMES = 120;
  const ICON_LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const ICON_USER_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5M22 8l-5 5"/></svg>';
  const ICON_ALERT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
  const ICON_SEARCH = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const ICON_CROWN = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18h18l1.500-10-5.500 4-5-7-5 7-5.500-4z"/><rect x="3" y="19.500" width="18" height="2" rx="1"/></svg>';
  const ICON_SHIELD = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.400 9.400 8 11 4.600-1.600 8-6 8-11V5z"/></svg>';
  const ICON_LITE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>';
  const ICON_DISCORD = '<svg class="discord-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>';

  const params = new URLSearchParams(window.location.search);
  const rawQuery = String(params.get('nick') || params.get('id') || params.get('q') || '').trim();
  const profileEl = document.getElementById('profile');
  const infoEl = document.getElementById('info');
  const viewerCard = document.getElementById('viewerCard');
  const capesSection = document.getElementById('capesSection');
  const stateEl = document.getElementById('state');
  let viewer = null;
  let animTimer = null;

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function capeUrl(file) {
    return CAPES_BASE + String(file).split('/').map(encodeURIComponent).join('/');
  }

  function formatPlaytime(ms) {
    const minutes = Math.floor((ms || 0) / 60000);
    if (minutes < 1) return '0 min';
    if (minutes < 60) return minutes + ' min';
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours.toLocaleString('en-US') + ' h' + (rest && hours < 100 ? ' ' + rest + ' min' : '');
  }

  function timeAgo(date) {
    const sec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
    if (sec < 120) return 'just now';
    const min = Math.round(sec / 60);
    if (min < 60) return min + ' minutes ago';
    const hours = Math.round(min / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : hours + ' hours ago';
    const days = Math.round(hours / 24);
    if (days < 30) return days === 1 ? 'yesterday' : days + ' days ago';
    return 'on ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function showState(icon, title, text, withSearch) {
    profileEl.hidden = true;
    capesSection.hidden = true;
    stateEl.hidden = false;
    stateEl.innerHTML = '';
    const iconWrap = el('div', 'state-icon');
    iconWrap.innerHTML = icon;
    stateEl.appendChild(iconWrap);
    stateEl.appendChild(el('h1', null, title));
    stateEl.appendChild(el('p', null, text));
    if (withSearch) {
      const form = el('form', 'search');
      form.setAttribute('role', 'search');
      form.setAttribute('novalidate', '');
      form.innerHTML = ICON_SEARCH + '<input type="search" name="q" placeholder="Minecraft username or Discord ID" aria-label="Minecraft username or Discord ID" autocomplete="off" spellcheck="false"/><button type="submit">Search</button>';
      stateEl.appendChild(form);
      stateEl.appendChild(el('p', 'search-error'));
      window.FrostPlayers.bindSearch(form);
    }
  }

  function drawCapeFrame(canvas) {
    try {
      const ctx = viewer.capeCanvas.getContext('2d');
      ctx.clearRect(0, 0, viewer.capeCanvas.width, viewer.capeCanvas.height);
      ctx.drawImage(canvas, 0, 0, viewer.capeCanvas.width, viewer.capeCanvas.height);
      if (viewer.capeTexture) viewer.capeTexture.needsUpdate = true;
    } catch (err) {}
  }

  function animateCape(url) {
    if (!window.FrostGif) return;
    const frames = [];
    let done = false;
    let idx = 0;
    let started = false;
    function step() {
      if (idx >= frames.length) {
        if (done && frames.length > 1) idx = 0;
        else {
          animTimer = setTimeout(step, 40);
          return;
        }
      }
      const frame = frames[idx++];
      drawCapeFrame(frame.canvas);
      animTimer = setTimeout(step, frame.delay);
    }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http_' + r.status);
      return r.arrayBuffer();
    }).then(function (buffer) {
      return window.FrostGif.decode(buffer, { width: ANIM_W, height: ANIM_H, maxFrames: ANIM_MAX_FRAMES }, function (frame) {
        frames.push(frame);
        if (!started && frames.length >= 2) {
          started = true;
          step();
        }
      });
    }).then(function () {
        done = true;
    }).catch(function () {
        done = true;
    });
  }

  function loadCape(cape) {
    if (!viewer || !cape) return;
    const result = viewer.loadCape(capeUrl(cape.file));
    const animate = function () {
        if (cape.animated && cape.animatedFile) animateCape(capeUrl(cape.animatedFile));
    };
    if (result && result.then) result.then(animate).catch(function () {});
    else animate();
  }

  function startViewer(data) {
    if (typeof skinview3d === 'undefined') return;
    const canvas = document.createElement('canvas');
    viewerCard.appendChild(canvas);
    const rect = viewerCard.getBoundingClientRect();
    try {
      viewer = new skinview3d.SkinViewer({
        canvas: canvas,
        width: Math.round(rect.width) || 400,
        height: Math.round(rect.height) || 500,
        zoom: 0.85
      });
    } catch (err) {
      canvas.remove();
      return;
    }
    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;
    viewer.autoRotate = false;
    if (skinview3d.IdleAnimation) viewer.animation = new skinview3d.IdleAnimation();
    (viewer.playerWrapper || viewer.playerObject).rotation.y = Math.PI - 0.6;
    const skin = data.skinUrl || 'skin.png';
    const loaded = viewer.loadSkin(skin, { model: data.model === 'slim' ? 'slim' : 'default' });
    if (loaded && loaded.catch) loaded.catch(function () { viewer.loadSkin('skin.png'); });
    if (data.cape) {
      if (data.cape.mature) {
        const reveal = el('button', 'viewer-mature', 'Show mature cape');
        reveal.type = 'button';
        reveal.addEventListener('click', function () {
          reveal.remove();
          loadCape(data.cape);
        });
        viewerCard.appendChild(reveal);
      } else {
        loadCape(data.cape);
      }
    }
    viewerCard.appendChild(el('div', 'viewer-hint', 'Drag to rotate'));
    new ResizeObserver(function () {
      const r = viewerCard.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) viewer.setSize(Math.round(r.width), Math.round(r.height));
    }).observe(viewerCard);
  }

  function stat(label, value, sub, muted) {
    const box = el('div', 'stat');
    box.appendChild(el('div', 'stat-label', label));
    box.appendChild(el('div', 'stat-value' + (muted ? ' is-muted' : ''), value));
    if (sub) box.appendChild(el('div', 'stat-sub', sub));
    return box;
  }

  function renderInfo(data) {
    infoEl.innerHTML = '';
    const nameRow = el('div', 'name-row');
    nameRow.appendChild(el('h1', null, data.name));
    if (data.rank === 'owner' || data.rank === 'staff') {
      const rank = el('span', 'badge-rank badge-rank--' + data.rank);
      rank.innerHTML = data.rank === 'owner' ? ICON_CROWN : ICON_SHIELD;
      rank.appendChild(document.createTextNode(data.rank === 'owner' ? 'OWNER' : 'STAFF'));
      rank.title = data.rank === 'owner' ? 'FrostClient owner' : 'FrostClient staff team';
      nameRow.appendChild(rank);
    }
    if (data.lite) {
      const lite = el('span', 'badge-lite');
      lite.innerHTML = ICON_LITE;
      lite.appendChild(document.createTextNode('LITE'));
      lite.title = 'FrostClient Lite subscriber';
      nameRow.appendChild(lite);
    }
    if (data.online !== null && data.online !== undefined) {
      const pill = el('span', 'status-pill' + (data.online ? ' is-online' : ''), data.online ? 'Playing now' : 'Offline');
      const last = !data.online && data.lastSeen ? new Date(data.lastSeen) : null;
      if (last && !isNaN(last.getTime())) {
        pill.textContent = 'Last active ' + timeAgo(last);
        pill.title = last.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      }
      nameRow.appendChild(pill);
    }
    infoEl.appendChild(nameRow);
    if (data.discord) {
      const row = el('div', 'discord-row');
      row.insertAdjacentHTML('beforeend', ICON_DISCORD);
      if (data.discord.avatar) {
        const img = el('img');
        img.src = data.discord.avatar;
        img.alt = '';
        img.addEventListener('error', function () { img.remove(); });
        row.appendChild(img);
      }
      row.appendChild(el('strong', null, data.discord.name || data.discord.username || 'Discord user'));
      if (data.discord.username && data.discord.name !== data.discord.username) row.appendChild(el('span', null, '@' + data.discord.username));
      infoEl.appendChild(row);
    }
    const stats = el('div', 'stats');
    if (data.playtimeMs === null || data.playtimeMs === undefined) stats.appendChild(stat('Playtime', 'Hidden', 'by the player', true));
    else stats.appendChild(stat('Playtime', formatPlaytime(data.playtimeMs), 'on FrostClient'));
    const capeCount = (data.capes || []).length;
    stats.appendChild(stat('Capes owned', String(capeCount), capeCount === 1 ? 'Frost cape' : 'Frost capes'));
    const since = data.memberSince ? formatDate(data.memberSince) : null;
    if (since) stats.appendChild(stat('Member since', since, null));
    else stats.appendChild(stat('Member since', data.earlyPlayer ? 'Early player' : 'Unknown', data.earlyPlayer ? 'before October 2026' : null, !data.earlyPlayer));
    if (typeof data.views === 'number') stats.appendChild(stat('Profile views', data.views.toLocaleString('en-US'), data.views === 1 ? 'unique visit' : 'unique visits'));
    infoEl.appendChild(stats);
    if (data.cape) {
      const eq = el('div', 'equipped');
      const thumb = el('div', 'cape-thumb');
      if (!data.cape.mature) thumb.style.backgroundImage = 'url("' + capeUrl(data.cape.file) + '")';
      eq.appendChild(thumb);
      const text = el('div');
      text.appendChild(el('div', 'equipped-label', 'Equipped cape'));
      text.appendChild(el('div', 'equipped-name', data.cape.name || data.cape.id));
      eq.appendChild(text);
      infoEl.appendChild(eq);
    }
  }

  function renderCapes(data) {
    const grid = document.getElementById('capesGrid');
    grid.innerHTML = '';
    const capes = (data.capes || []).slice().sort(function (a, b) {
      const eqA = data.cape && data.cape.id === a.id ? 0 : 1;
      const eqB = data.cape && data.cape.id === b.id ? 0 : 1;
      return eqA - eqB || String(a.name).localeCompare(String(b.name));
    });
    document.getElementById('capesCount').textContent = capes.length ? String(capes.length) : '';
    if (!capes.length) {
      grid.appendChild(el('div', 'empty-note', data.discord === null && !data.lite ? 'No Frost capes to show yet.' : 'This player has no Frost capes yet.'));
    }
    capes.forEach(function (cape) {
      const card = el(cape.store ? 'a' : 'div', 'cape-card' + (cape.mature ? ' is-mature' : ''));
      if (cape.store) card.href = STORE_CAPE + encodeURIComponent(cape.id);
      const thumb = el('div', 'cape-thumb');
      thumb.style.backgroundImage = 'url("' + capeUrl(cape.file) + '")';
      card.appendChild(thumb);
      card.appendChild(el('div', 'cape-card-name', cape.name || cape.id));
      if (data.cape && data.cape.id === cape.id) card.appendChild(el('span', 'cape-card-tag', 'Equipped'));
      if (cape.mature) card.appendChild(el('span', 'cape-card-tag is-mature', 'Mature'));
      grid.appendChild(card);
    });
    capesSection.hidden = false;
  }

  function render(data) {
    if (!data.cape) data.cape = DEFAULT_CAPE;
    document.title = data.name + ' | Frost Players';
    profileEl.removeAttribute('aria-busy');
    renderInfo(data);
    renderCapes(data);
    startViewer(data);
    const canonical = window.FrostPlayers.playerPage + '?nick=' + encodeURIComponent(data.name);
    if (window.location.search !== canonical.slice(canonical.indexOf('?'))) {
      try {
          history.replaceState(null, '', canonical);
      } catch (e) {}
    }
  }

  if (!window.FrostPlayers.playerUrl(rawQuery)) {
    document.title = 'Player not found | Frost Players';
    showState(ICON_USER_X, rawQuery ? 'Not a valid name' : 'Search for a player', rawQuery ? 'Minecraft usernames use only letters, numbers and _. You can also search by Discord ID.' : 'Type a Minecraft username or a Discord ID.', true);
    return;
  }

  const queryParam = /^\d{15,21}$/.test(rawQuery) ? 'id=' : 'nick=';
  fetch(API + '?' + queryParam + encodeURIComponent(rawQuery), { cache: 'no-store' })
    .then(function (r) {
      return r.json().then(function (body) { return { status: r.status, body: body }; });
    })
    .then(function (res) {
      const data = res.body || {};
      if (res.status === 200 && data.ok && data.private) {
        document.title = data.name + ' | Frost Players';
        showState(ICON_LOCK, data.name, 'This player has a private profile.', true);
        return;
      }
      if (res.status === 200 && data.ok) return render(data);
      if (res.status === 404) {
        document.title = 'Player not found | Frost Players';
        showState(ICON_USER_X, 'Player not found', /^\d+$/.test(rawQuery) ? "No FrostClient player has linked and shared this Discord ID." : '“' + rawQuery + '” hasn’t played FrostClient yet, or the name doesn’t exist.', true);
        return;
      }
      if (res.status === 429) {
        showState(ICON_ALERT, 'Slow down a little', 'Too many searches in a short time. Wait a minute and try again.', true);
        return;
      }
      showState(ICON_ALERT, 'Couldn’t load this profile', 'Something went wrong on our side or at Mojang. Try again in a moment.', true);
    })
    .catch(function () {
        showState(ICON_ALERT, 'Couldn’t load this profile', 'Check your connection and try again.', true);
    });

  window.addEventListener('pagehide', function () {
      if (animTimer) clearTimeout(animTimer);
  });
})();
