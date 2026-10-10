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

  function decodeGifFrames(url) {
    if (typeof ImageDecoder === 'undefined') return Promise.resolve([]);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http_' + r.status);
      return r.arrayBuffer();
    }).then(function (buffer) {
      const decoder = new ImageDecoder({ data: buffer, type: 'image/gif' });
      return decoder.tracks.ready.then(function () {
        const track = decoder.tracks.selectedTrack;
        const count = track ? track.frameCount : 0;
        const step = Math.max(1, Math.ceil(count / ANIM_MAX_FRAMES));
        const frames = [];
        let chain = Promise.resolve();
        for (let i = 0; i < count; i += step) {
          (function (idx) {
            chain = chain.then(function () {
              return decoder.decode({ frameIndex: idx }).then(function (result) {
                const image = result.image;
                const c = document.createElement('canvas');
                c.width = ANIM_W;
                c.height = ANIM_H;
                c.getContext('2d').drawImage(image, 0, 0, ANIM_W, ANIM_H);
                frames.push({ canvas: c, delay: (image.duration ? Math.max(30, image.duration / 1000) : 100) * step });
                image.close();
              });
            });
          })(i);
        }
        return chain.then(function () {
          decoder.close();
          return frames;
        });
      });
    }).catch(function () {
        return [];
    });
  }

  function playFrames(frames) {
    if (!viewer || frames.length < 2) return;
    let idx = 0;
    (function step() {
      const frame = frames[idx];
      idx = (idx + 1) % frames.length;
      try {
        const ctx = viewer.capeCanvas.getContext('2d');
        ctx.clearRect(0, 0, viewer.capeCanvas.width, viewer.capeCanvas.height);
        ctx.drawImage(frame.canvas, 0, 0, viewer.capeCanvas.width, viewer.capeCanvas.height);
        if (viewer.capeTexture) viewer.capeTexture.needsUpdate = true;
      } catch (err) {}
      animTimer = setTimeout(step, frame.delay);
    })();
  }

  function loadCape(cape) {
    if (!viewer || !cape) return;
    const result = viewer.loadCape(capeUrl(cape.file));
    if (result && result.then) {
      result.then(function () {
        if (!cape.animated || !cape.animatedFile) return;
        decodeGifFrames(capeUrl(cape.animatedFile)).then(playFrames);
      }).catch(function () {});
    }
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
    if (data.lite) {
      const lite = el('span', 'badge-lite');
      lite.innerHTML = ICON_LITE;
      lite.appendChild(document.createTextNode('LITE'));
      lite.title = 'FrostClient Lite subscriber';
      nameRow.appendChild(lite);
    }
    if (data.online !== null && data.online !== undefined) {
      nameRow.appendChild(el('span', 'status-pill' + (data.online ? ' is-online' : ''), data.online ? 'Playing now' : 'Offline'));
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
    const canonical = 'player?nick=' + encodeURIComponent(data.name);
    if (window.location.pathname + window.location.search !== canonical) {
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
