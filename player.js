(function () {
  const API = 'https://bot.frostclient.eu/players/profile';
  const CAPES_BASE = 'https://bot.frostclient.eu/launcher/capes/';
  const STORE_CAPE = 'https://store.frostclient.eu/cloak?id=';
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

  const ICON_GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>';
  const SETTINGS_OPTIONS = [
    { key: 'showPlaytime', label: 'Show playtime', hint: 'Your total FrostClient playtime.' },
    { key: 'showOnline', label: 'Show online status', hint: 'Whether you are playing right now, and when you were last active.' },
    { key: 'showDiscord', label: 'Show Discord account', hint: 'Your Discord name. People can also find you by your Discord ID.' },
    { key: 'showCapes', label: 'Show my cloak collection', hint: 'When off, visitors only see the cloak you have equipped.' },
    { key: 'privateProfile', label: 'Private profile', hint: 'Hide everything. Visitors only see that the profile is private.', lite: true }
  ];

  const SOCIAL_RULES = {
    youtube: { label: 'YouTube', placeholder: 'youtube.com/@name', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com'], re: /^\/(@[A-Za-z0-9_.-]{3,30}|channel\/UC[A-Za-z0-9_-]{22}|c\/[A-Za-z0-9_.-]{1,100}|user\/[A-Za-z0-9_.-]{1,100})\/?$/, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3z" fill="#000"/></svg>' },
    twitch: { label: 'Twitch', placeholder: 'twitch.tv/name', hosts: ['twitch.tv', 'www.twitch.tv', 'm.twitch.tv'], re: /^\/([A-Za-z0-9_]{4,25})\/?$/, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h17v11l-5 5h-4l-3 3H7v-3H3V6z" fill="currentColor"/><path d="M11 7v5M16 7v5" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>' },
    tiktok: { label: 'TikTok', placeholder: 'tiktok.com/@name', hosts: ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'], re: /^\/(@[A-Za-z0-9_.]{2,24})\/?$/, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3.2A2.8 2.8 0 1 0 14 15z" fill="currentColor"/></svg>' },
    kick: { label: 'Kick', placeholder: 'kick.com/name', hosts: ['kick.com', 'www.kick.com'], re: /^\/([A-Za-z0-9_-]{3,25})\/?$/, icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h5v5h2V6h2V3h7v6h-2v2h-2v2h2v2h2v6h-7v-3h-2v-2H9v5H4z" fill="currentColor"/></svg>' }
  };
  const EDIT_TABS = [{ id: 'privacy', label: 'Privacy' }, { id: 'links', label: 'Linked Accounts' }, { id: 'friends', label: 'Friends' }];
  const FRIEND_NAME_COLORS = [0x55FF55, 0x55FFFF, 0x4FC8F8, 0xFFFF55, 0xFFAA00, 0xFF5555, 0xFF55FF, 0xFFFFFF];
  const CREATOR_TIERS = {
    media: { label: 'MEDIA', title: 'FrostClient Media creator', sub: 'Makes content with Frost' },
    partner: { label: 'PARTNER', title: 'FrostClient Partner', sub: 'Official creator partner' },
    partner_plus: { label: 'PARTNER+', title: 'FrostClient Partner+', sub: 'Top tier creator partner' }
  };

  const params = new URLSearchParams(window.location.search);
  let pathSeg = '';
  try {
      pathSeg = decodeURIComponent(window.location.pathname.replace(/^\/+|\/+$/g, ''));
  } catch (e) {}
  if (/^(player|player\.html|404|404\.html|index\.html)$/i.test(pathSeg) || pathSeg.indexOf('/') !== -1) pathSeg = '';
  const isSettingsRoute = pathSeg.toLowerCase() === 'settings';
  const isFriendsRoute = pathSeg.toLowerCase() === 'friends';
  const rawQuery = String(params.get('nick') || params.get('id') || params.get('q') || (isSettingsRoute || isFriendsRoute ? '' : pathSeg)).trim();
  const friendsApi = window.FrostFriends;
  const auth = window.FrostPlayersAuth;
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
        const reveal = el('button', 'viewer-mature', 'Show mature cloak');
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
    const nameWrap = el('span', 'name-wrap');
    nameWrap.appendChild(el('h1', null, data.name));
    nameRow.appendChild(nameWrap);
    if (data.rank === 'owner' || data.rank === 'staff') {
      const rank = el('span', 'badge-rank badge-rank--' + data.rank);
      rank.innerHTML = data.rank === 'owner' ? ICON_CROWN : ICON_SHIELD;
      rank.appendChild(document.createTextNode(data.rank === 'owner' ? 'OWNER' : 'STAFF'));
      rank.title = data.rank === 'owner' ? 'FrostClient owner' : 'FrostClient staff team';
      nameRow.appendChild(rank);
    }
    if (data.creatorTier && CREATOR_TIERS[data.creatorTier]) {
      const tier = CREATOR_TIERS[data.creatorTier];
      const badge = el('span', 'badge-creator badge-creator--' + data.creatorTier, tier.label);
      badge.tabIndex = 0;
      badge.setAttribute('aria-label', tier.title + ', ' + tier.sub);
      const tip = el('span', 'badge-tip');
      tip.appendChild(el('span', 'badge-tip-title', tier.title));
      tip.appendChild(el('span', 'badge-tip-sub', tier.sub));
      badge.appendChild(tip);
      nameRow.appendChild(badge);
    }
    if (data.lite) {
      const lite = el('span', 'badge-lite');
      lite.innerHTML = ICON_LITE;
      lite.appendChild(document.createTextNode('LITE'));
      const plans = {
        annual: ['Active FrostClient Lite subscription', 'Yearly plan'],
        monthly: ['Active FrostClient Lite subscription', 'Monthly plan'],
        gifted: ['FrostClient Lite is gifted', 'Someone gifted this player Lite'],
        boost: ['Active FrostClient Lite', 'Server boost reward']
      };
      const info = plans[data.litePlan] || ['Active FrostClient Lite subscription', ''];
      if (data.litePlan === 'annual') lite.classList.add('badge-lite--annual');
      if (data.litePlan === 'gifted') lite.classList.add('badge-lite--gifted');
      lite.tabIndex = 0;
      lite.setAttribute('aria-label', info[0] + (info[1] ? ', ' + info[1] : ''));
      const tip = el('span', 'badge-tip');
      tip.appendChild(el('span', 'badge-tip-title', info[0]));
      if (info[1]) tip.appendChild(el('span', 'badge-tip-sub', info[1]));
      lite.appendChild(tip);
      nameRow.appendChild(lite);
    }
    if (data.online !== null && data.online !== undefined) {
      const pill = el('span', 'status-pill' + (data.online ? ' is-online' : ''), data.online ? 'Playing now' : 'Offline');
      const last = !data.online && data.lastSeen ? new Date(data.lastSeen) : null;
      if (last && !isNaN(last.getTime())) {
        pill.textContent = 'Last active ' + timeAgo(last);
        pill.dataset.tip = last.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
        pill.tabIndex = 0;
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
    if (data.capesHidden) stats.appendChild(stat('Cloaks owned', 'Private', 'hidden by the player', true));
    else if (data.capesUnknown) stats.appendChild(stat('Cloaks owned', '—', 'couldn’t load right now', true));
    else stats.appendChild(stat('Cloaks owned', String(capeCount), capeCount === 1 ? 'Frost cloak' : 'Frost cloaks'));
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
      text.appendChild(el('div', 'equipped-label', 'Equipped cloak'));
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
      return eqA - eqB || String(a.name).localeCompare(String(b.name), 'en', { sensitivity: 'base' });
    });
    document.getElementById('capesCount').textContent = capes.length ? String(capes.length) : '';
    if (data.capesHidden) {
      grid.appendChild(el('div', 'empty-note', capes.length ? 'This player keeps their cloak collection private. Only the equipped cloak is shown.' : 'This player keeps their cloak collection private.'));
    } else if (data.capesUnknown) {
      grid.appendChild(el('div', 'empty-note', capes.length ? 'Only the equipped cloak could be loaded right now. Refresh in a moment to see the full collection.' : 'Cloaks couldn’t be loaded right now. Refresh in a moment.'));
    } else if (!capes.length) {
      grid.appendChild(el('div', 'empty-note', data.discord === null && !data.lite ? 'No Frost cloaks to show yet.' : 'This player has no Frost cloaks yet.'));
    }
    capes.forEach(function (cape) {
      const card = el(cape.store ? 'a' : 'div', 'cape-card' + (cape.mature ? ' is-mature' : ''));
      if (cape.store) card.href = STORE_CAPE + encodeURIComponent(cape.id);
      const thumb = el('div', 'cape-thumb');
      thumb.style.backgroundImage = 'url("' + capeUrl(cape.file) + '")';
      card.appendChild(thumb);
      card.appendChild(el('div', 'cape-card-name', cape.name || cape.id));
      const tags = el('div', 'cape-card-tags');
      if (data.cape && data.cape.id === cape.id) tags.appendChild(el('span', 'cape-card-tag', 'Equipped'));
      const until = cape.limitedUntil ? Date.parse(cape.limitedUntil) : NaN;
      if (Number.isFinite(until)) {
        const limited = el('span', 'cape-card-tag is-limited', 'Limited');
        limited.dataset.tip = 'Limited until ' + new Date(until - 1).toLocaleDateString('en-US', { dateStyle: 'long' });
        limited.tabIndex = 0;
        tags.appendChild(limited);
      }
      if (tags.childNodes.length) card.appendChild(tags);
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
    renderSocials(data.socials || {});
    renderCapes(data);
    startViewer(data);
    setCanonical(data.name);
    attachOwnerTools(data.name, false);
    attachFriendTools(data);
  }

  function friendState(friends, uuid) {
    const id = friendsApi.normUuid(uuid);
    const match = function (list) {
      return (list || []).find(function (f) { return friendsApi.normUuid(f.uuid) === id; }) || null;
    };
    if (match(friends.friends)) return { state: 'friend', entry: match(friends.friends) };
    if (match(friends.incoming)) return { state: 'incoming', entry: match(friends.incoming) };
    if (match(friends.outgoing)) return { state: 'outgoing', entry: match(friends.outgoing) };
    return { state: 'none', entry: null };
  }

  function attachFriendTools(data) {
    const nameRow = document.querySelector('#info .name-row');
    const nameWrap = nameRow && nameRow.querySelector('.name-wrap');
    if (!nameRow || !friendsApi) return;
    const btn = el('button', 'friend-btn');
    btn.type = 'button';
    btn.hidden = true;
    const note = el('span', 'friend-note');
    nameRow.appendChild(btn);
    nameRow.appendChild(note);
    if (!auth || !auth.loadToken()) {
      btn.hidden = false;
      btn.textContent = 'Add friend';
      btn.addEventListener('click', function () { auth.login(); });
      return;
    }
    let current = null;
    const paint = function (friends) {
      note.textContent = '';
      if (!friends || !friends.me || friendsApi.normUuid(friends.me.uuid) === friendsApi.normUuid(data.uuid)) {
        btn.hidden = true;
        return;
      }
      current = friendState(friends, data.uuid);
      btn.hidden = false;
      btn.disabled = false;
      btn.className = 'friend-btn';
      const isFriend = current.state === 'friend';
      nameWrap.classList.toggle('is-friend', isFriend);
      const oldTip = nameWrap.querySelector('.badge-tip');
      if (oldTip) oldTip.remove();
      if (isFriend) {
        nameWrap.tabIndex = 0;
        const tip = el('span', 'badge-tip');
        tip.appendChild(el('span', 'badge-tip-title', 'In your friend list'));
        nameWrap.appendChild(tip);
      } else nameWrap.removeAttribute('tabindex');
      if (isFriend) {
        btn.textContent = 'Remove friend';
        btn.classList.add('is-remove');
      } else if (current.state === 'incoming') {
        btn.textContent = 'Accept friend request';
        btn.classList.add('is-primary');
      } else if (current.state === 'outgoing') {
        btn.textContent = 'Cancel request';
        note.textContent = 'Request sent';
      } else if (data.friendRequests === false) {
        btn.textContent = 'Add friend';
        btn.disabled = true;
        note.textContent = 'Not accepting friend requests';
      } else {
        btn.textContent = 'Add friend';
        btn.classList.add('is-primary');
      }
    };
    const handle = function (promise) {
      btn.disabled = true;
      promise.then(function (res) {
        if (res && res.ok === false) {
          const msg = { requests_closed: 'Not accepting friend requests', limit: 'Your friend list is full', already_friends: 'Already friends', rate_limited: 'Too many changes, wait a minute', no_account: 'Play FrostClient once to use friends', unknown_player: 'Player not found' }[res.error] || "Couldn't update. Try again.";
          if (res.me) paint(res);
          note.textContent = msg;
          if (res.error === 'requests_closed') btn.disabled = true;
          else btn.disabled = false;
          return;
        }
        if (res) paint(res);
      }).catch(function () {
        btn.disabled = false;
        note.textContent = "Couldn't update. Try again.";
      });
    };
    btn.addEventListener('click', function () {
      if (!current) return;
      if (current.state === 'friend') {
        friendsApi.removeFriend({ uuid: current.entry.uuid, name: data.name }).then(function (res) {
            if (res) paint(res);
        }).catch(function () {
            note.textContent = "Couldn't update. Try again.";
        });
      } else if (current.state === 'incoming') handle(auth.friendAction('accept', { uuid: current.entry.uuid }));
      else if (current.state === 'outgoing') handle(auth.friendAction('cancel', { uuid: current.entry.uuid }));
      else handle(auth.friendAction('add', { name: data.name }));
    });
    auth.getFriends().then(function (friends) {
      if (friends && friends.error === 'no_account') {
        btn.hidden = false;
        btn.disabled = true;
        btn.textContent = 'Add friend';
        note.textContent = 'Play FrostClient once to use friends';
        return;
      }
      paint(friends);
    }).catch(function () {});
    document.addEventListener('frost-friends', function (e) {
        if (e.detail && e.detail.me) paint(e.detail);
    });
  }

  function renderFriendsPage() {
    document.title = 'Friends | Frost Players';
    profileEl.hidden = true;
    capesSection.hidden = true;
    const main = document.getElementById('main');
    const page = el('section', 'friends-page');
    const head = el('div', 'friends-page-head');
    head.appendChild(el('h1', null, 'Friends'));
    const sub = el('p', 'friends-page-sub', 'Your FrostClient friends. Changes here show up in game too.');
    head.appendChild(sub);
    page.appendChild(head);
    const body = el('div', 'friends-page-body');
    body.appendChild(el('div', 'skeleton skel-stats'));
    page.appendChild(body);
    main.appendChild(page);
    const section = function (title, items, build, empty) {
      const box = el('div', 'friends-section');
      const h = el('div', 'section-head');
      h.appendChild(el('h2', null, title));
      h.appendChild(el('span', 'section-count', items.length ? String(items.length) : ''));
      box.appendChild(h);
      const list = el('div', 'friends-list');
      if (!items.length && empty) list.appendChild(el('p', 'friends-empty', empty));
      items.forEach(function (item) { list.appendChild(build(item)); });
      box.appendChild(list);
      return box;
    };
    const actionBtn = function (label, cls, fn) {
      const b = el('button', 'friend-action ' + cls, label);
      b.type = 'button';
      b.addEventListener('click', function () {
        b.disabled = true;
        fn().catch(function () {}).then(function () { b.disabled = false; });
      });
      return b;
    };
    const paint = function (data) {
      body.innerHTML = '';
      if (data && data.error === 'no_account') {
        body.appendChild(el('p', 'friends-empty', 'Play FrostClient once with this Discord account to use friends.'));
        return;
      }
      const incoming = data.incoming || [];
      if (incoming.length) {
        body.appendChild(section('Friend requests', incoming, function (req) {
          const row = friendsApi.friendRow(req, { status: 'Wants to be your friend' });
          const acts = el('div', 'friend-actions');
          acts.appendChild(actionBtn('Accept', 'is-primary', function () { return auth.friendAction('accept', { uuid: req.uuid }); }));
          acts.appendChild(actionBtn('Decline', '', function () { return auth.friendAction('decline', { uuid: req.uuid }); }));
          row.appendChild(acts);
          return row;
        }));
      }
      const friends = friendsApi.sortFriends(data.friends);
      body.appendChild(section('All friends', friends, function (friend) {
        const row = friendsApi.friendRow(friend);
        const remove = friendsApi.iconButton('friend-remove', 'Remove ' + friend.name, friendsApi.ICON_X);
        remove.addEventListener('click', function () {
            friendsApi.removeFriend(friend).catch(function () {});
        });
        row.appendChild(remove);
        return row;
      }, 'No friends yet. Open a player profile and press Add friend, or add friends in game.'));
      const outgoing = data.outgoing || [];
      if (outgoing.length) {
        body.appendChild(section('Sent requests', outgoing, function (req) {
          const row = friendsApi.friendRow(req, { status: 'Waiting for an answer' });
          const acts = el('div', 'friend-actions');
          acts.appendChild(actionBtn('Cancel', '', function () { return auth.friendAction('cancel', { uuid: req.uuid }); }));
          row.appendChild(acts);
          return row;
        }));
      }
    };
    if (!auth || !auth.loadToken()) {
      auth.login('/friends');
      return;
    }
    auth.getFriends(true).then(paint).catch(function (err) {
      if (err && err.expired) return auth.login('/friends');
      body.innerHTML = '';
      body.appendChild(el('p', 'friends-empty', 'Couldn’t load your friends. Check your connection and try again.'));
    });
    document.addEventListener('frost-friends', function (e) {
        if (e.detail && e.detail.me) paint(e.detail);
    });
  }

  function setCanonical(name) {
    const canonical = window.FrostPlayers.prettyPath(name);
    if (!canonical) return;
    const current = window.location.pathname.replace(/^\/+/, '') + window.location.search;
    if (current === canonical.replace(/^\/+/, '')) return;
    try {
        history.replaceState(null, '', canonical + window.location.hash);
    } catch (e) {}
  }

  let editData = null;
  let editModal = null;

  function socialValid(key, value) {
    const rule = SOCIAL_RULES[key];
    let url;
    try {
        url = new URL(/^https?:\/\//i.test(value) ? value : 'https://' + value);
    } catch (e) {
        return false;
    }
    return rule.hosts.indexOf(url.hostname.toLowerCase()) !== -1 && !url.port && !url.username && rule.re.test(url.pathname);
  }

  function buildEditModal() {
    if (editModal) return editModal;
    const overlay = el('div', 'modal-overlay');
    overlay.hidden = true;
    const dialog = el('div', 'modal');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'editTitle');
    const head = el('div', 'modal-head');
    const title = el('h2', null, 'Edit profile');
    title.id = 'editTitle';
    head.appendChild(title);
    const close = el('button', 'modal-close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    close.addEventListener('click', closeEditModal);
    head.appendChild(close);
    dialog.appendChild(head);
    const tabs = el('div', 'modal-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Profile settings');
    const panels = {};
    EDIT_TABS.forEach(function (t) {
      const tab = el('button', 'modal-tab', t.label);
      tab.type = 'button';
      tab.id = 'editTab-' + t.id;
      tab.dataset.tab = t.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'editPanel-' + t.id);
      tab.addEventListener('click', function () { selectEditTab(t.id); });
      tabs.appendChild(tab);
      const panel = el('div', 'modal-panel');
      panel.id = 'editPanel-' + t.id;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panels[t.id] = panel;
    });
    const indicator = el('span', 'modal-tab-indicator');
    indicator.setAttribute('aria-hidden', 'true');
    tabs.appendChild(indicator);
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const ids = EDIT_TABS.map(function (t) { return t.id; });
      const current = ids.indexOf(tabs.querySelector('[aria-selected="true"]').dataset.tab);
      const next = ids[(current + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
      selectEditTab(next);
      tabs.querySelector('[data-tab="' + next + '"]').focus();
    });
    dialog.appendChild(tabs);
    EDIT_TABS.forEach(function (t) { dialog.appendChild(panels[t.id]); });

    const links = el('form', 'modal-section');
    links.noValidate = true;
    links.appendChild(el('p', 'modal-hint', 'Shown on your profile. Only official channel links are accepted.'));
    Object.keys(SOCIAL_RULES).forEach(function (key) {
      const rule = SOCIAL_RULES[key];
      const field = el('label', 'link-field');
      const icon = el('span', 'link-field-icon');
      icon.innerHTML = rule.icon;
      field.appendChild(icon);
      const input = el('input');
      input.type = 'url';
      input.name = key;
      input.placeholder = rule.placeholder;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-label', rule.label + ' link');
      input.addEventListener('input', function () {
        field.classList.remove('is-invalid');
        error.textContent = '';
      });
      field.appendChild(input);
      links.appendChild(field);
      const error = el('p', 'link-error');
      error.dataset.for = key;
      links.appendChild(error);
    });
    const linksFoot = el('div', 'modal-actions');
    const linksStatus = el('span', 'modal-status');
    linksStatus.setAttribute('role', 'status');
    const save = el('button', 'btn-save', 'Save links');
    save.type = 'submit';
    linksFoot.appendChild(linksStatus);
    linksFoot.appendChild(save);
    links.appendChild(linksFoot);
    links.addEventListener('submit', function (e) {
      e.preventDefault();
      const socials = {};
      let bad = false;
      Object.keys(SOCIAL_RULES).forEach(function (key) {
        const input = links.querySelector('input[name="' + key + '"]');
        const value = input.value.trim();
        const error = links.querySelector('.link-error[data-for="' + key + '"]');
        if (value && !socialValid(key, value)) {
          bad = true;
          input.parentElement.classList.add('is-invalid');
          error.textContent = 'Use your official ' + SOCIAL_RULES[key].label + ' link, like ' + SOCIAL_RULES[key].placeholder;
        }
        socials[key] = value;
      });
      if (bad) return;
      save.disabled = true;
      linksStatus.className = 'modal-status';
      linksStatus.textContent = 'Saving...';
      auth.saveSocials(socials).then(function (res) {
        editData = res;
        fillLinks();
        renderSocials(res.socials || {});
        linksStatus.className = 'modal-status is-ok';
        linksStatus.textContent = 'Saved';
      }).catch(function (err) {
        linksStatus.className = 'modal-status is-error';
        if (err && err.message === 'bad_social' && err.field) {
          const input = links.querySelector('input[name="' + err.field + '"]');
          if (input) input.parentElement.classList.add('is-invalid');
          linksStatus.textContent = 'That ' + SOCIAL_RULES[err.field].label + ' link is not an official channel link.';
        } else linksStatus.textContent = "Couldn't save. Try again.";
      }).then(function () {
          save.disabled = false;
      });
    });
    panels.links.appendChild(links);

    const privacy = el('div', 'modal-section');
    privacy.appendChild(el('p', 'modal-hint', 'Choose what visitors see on your profile. Changes are saved right away.'));
    const status = el('p', 'settings-status');
    status.setAttribute('role', 'status');
    privacy.appendChild(status);
    privacy.appendChild(el('div', 'settings-list'));
    panels.privacy.appendChild(privacy);
    const friendsBox = el('div', 'modal-section friend-settings');
    friendsBox.appendChild(el('p', 'modal-hint', 'The same settings as in game. Changes sync to FrostClient right away.'));
    const friendsStatus = el('p', 'settings-status friend-settings-status');
    friendsStatus.setAttribute('role', 'status');
    friendsBox.appendChild(friendsStatus);
    friendsBox.appendChild(el('div', 'friend-settings-body'));
    panels.friends.appendChild(friendsBox);

    const foot = el('div', 'modal-foot');
    foot.appendChild(el('span', null, 'Signed in with Discord'));
    const out = el('button', 'settings-signout', 'Sign out');
    out.type = 'button';
    out.addEventListener('click', function () { auth.logout(); });
    foot.appendChild(out);
    dialog.appendChild(foot);

    overlay.appendChild(dialog);
    overlay.addEventListener('mousedown', function (e) {
        if (e.target === overlay) closeEditModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !overlay.hidden) closeEditModal();
    });
    document.body.appendChild(overlay);
    editModal = overlay;
    window.addEventListener('resize', function () {
        if (!overlay.hidden) moveTabIndicator();
    });
    return overlay;
  }

  function fillLinks() {
    const socials = (editData && editData.socials) || {};
    Object.keys(SOCIAL_RULES).forEach(function (key) {
      const input = editModal.querySelector('input[name="' + key + '"]');
      input.value = socials[key] || '';
      input.parentElement.classList.remove('is-invalid');
      editModal.querySelector('.link-error[data-for="' + key + '"]').textContent = '';
    });
  }

  function openEditModal() {
    if (!editData) return;
    const overlay = buildEditModal();
    renderSettings(editData);
    fillLinks();
    setSettingsStatus('', '');
    setFriendStatus('', '');
    overlay.querySelector('.modal-status').textContent = '';
    overlay.hidden = false;
    selectEditTab('privacy');
    document.body.classList.add('modal-open');
    overlay.querySelector('.modal-tab[aria-selected="true"]').focus();
  }

  function closeEditModal() {
    if (!editModal) return;
    editModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (window.location.hash === '#settings') {
      try {
          history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
    }
    const btn = document.querySelector('.edit-profile-btn');
    if (btn) btn.focus();
  }

  function setSettingsStatus(text, kind) {
    const status = editModal.querySelector('.settings-status');
    status.textContent = text || '';
    status.className = 'settings-status' + (kind ? ' is-' + kind : '');
  }

  function renderSettings(data) {
    const list = editModal.querySelector('.settings-list');
    list.innerHTML = '';
    SETTINGS_OPTIONS.forEach(function (opt) {
      const locked = opt.lite && !data.lite;
      const row = el('label', 'settings-row' + (locked ? ' is-locked' : ''));
      const text = el('div', 'settings-text');
      const label = el('div', 'settings-label', opt.label);
      if (opt.lite) label.appendChild(el('span', 'settings-lite', 'LITE'));
      text.appendChild(label);
      text.appendChild(el('div', 'settings-hint', locked ? opt.hint + ' Requires FrostClient Lite.' : opt.hint));
      const sw = el('span', 'switch');
      const input = el('input');
      input.type = 'checkbox';
      input.checked = !!data.settings[opt.key] && !locked;
      input.disabled = locked;
      input.setAttribute('aria-label', opt.label);
      sw.appendChild(input);
      sw.appendChild(el('span', 'switch-track'));
      row.appendChild(text);
      row.appendChild(sw);
      input.addEventListener('change', function () {
        const patch = {};
        patch[opt.key] = input.checked;
        setSettingsStatus('Saving...', '');
        auth.savePrivacy(patch).then(function (res) {
          editData = res;
          renderSettings(res);
          setSettingsStatus('Saved. Visitors see the change after a reload.', 'ok');
        }).catch(function () {
          input.checked = !input.checked;
          setSettingsStatus("Couldn't save. Check your connection and try again.", 'error');
        });
      });
      list.appendChild(row);
    });
  }

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  function animateModalHeight(change) {
    const dialog = editModal && editModal.querySelector('.modal');
    if (!dialog || editModal.hidden || REDUCED_MOTION.matches) {
      change();
      return;
    }
    const from = dialog.getBoundingClientRect().height;
    dialog.style.transition = 'none';
    dialog.style.height = '';
    change();
    const to = dialog.getBoundingClientRect().height;
    if (Math.abs(to - from) < 2) {
      dialog.style.transition = '';
      return;
    }
    dialog.style.height = from + 'px';
    dialog.style.overflow = 'hidden';
    void dialog.offsetHeight;
    dialog.style.transition = 'height 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
    dialog.style.height = to + 'px';
    clearTimeout(dialog.heightTimer);
    dialog.heightTimer = setTimeout(function () {
      dialog.style.transition = '';
      dialog.style.height = '';
      dialog.style.overflow = '';
    }, 340);
  }

  function moveTabIndicator() {
    const tabs = editModal.querySelector('.modal-tabs');
    const active = tabs.querySelector('[aria-selected="true"]');
    const indicator = tabs.querySelector('.modal-tab-indicator');
    if (!active || !indicator) return;
    indicator.style.width = active.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + (active.offsetLeft - 4) + 'px)';
  }

  function selectEditTab(id) {
    const previous = editModal.querySelector('.modal-tab[aria-selected="true"]');
    const changed = !previous || previous.dataset.tab !== id;
    animateModalHeight(function () {
      editModal.querySelectorAll('.modal-tab').forEach(function (tab) {
        const on = tab.dataset.tab === id;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
      });
      editModal.querySelectorAll('.modal-panel').forEach(function (panel) {
        const show = panel.id === 'editPanel-' + id;
        panel.hidden = !show;
        panel.classList.remove('is-entering');
        if (show && changed && previous && !REDUCED_MOTION.matches) {
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
    });
    moveTabIndicator();
    if (id === 'friends') loadFriendSettings();
  }

  function settingToggle(label, hint, checked, onChange) {
    const row = el('label', 'settings-row');
    const text = el('div', 'settings-text');
    text.appendChild(el('div', 'settings-label', label));
    if (hint) text.appendChild(el('div', 'settings-hint', hint));
    const sw = el('span', 'switch');
    const input = el('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.setAttribute('aria-label', label);
    sw.appendChild(input);
    sw.appendChild(el('span', 'switch-track'));
    row.appendChild(text);
    row.appendChild(sw);
    input.addEventListener('change', function () { onChange(input.checked, input); });
    return row;
  }

  function setFriendStatus(text, kind) {
    const status = editModal.querySelector('.friend-settings-status');
    status.textContent = text || '';
    status.className = 'settings-status friend-settings-status' + (kind ? ' is-' + kind : '');
  }

  function saveFriendSetting(patch, input) {
    setFriendStatus('Saving...', '');
    return auth.friendAction('settings', patch).then(function (res) {
      if (!res || !res.ok) throw new Error('failed');
      renderFriendSettings(res);
      setFriendStatus('Saved and synced to your game.', 'ok');
    }).catch(function () {
      if (input) input.checked = !input.checked;
      setFriendStatus("Couldn't save. Check your connection and try again.", 'error');
    });
  }

  function loadFriendSettings() {
    const body = editModal.querySelector('.friend-settings-body');
    if (!body.childNodes.length) body.appendChild(el('div', 'skeleton skel-stats'));
    auth.getFriends().then(renderFriendSettings).catch(function () {
      body.innerHTML = '';
      body.appendChild(el('p', 'friends-empty', "Couldn't load your friend settings. Try again in a moment."));
    });
  }

  function renderFriendSettings(data) {
    animateModalHeight(function () { buildFriendSettings(data); });
  }

  function buildFriendSettings(data) {
    const body = editModal.querySelector('.friend-settings-body');
    body.innerHTML = '';
    if (!data || !data.settings) {
      body.appendChild(el('p', 'friends-empty', 'Play FrostClient once with this Discord account to use friends.'));
      return;
    }
    const st = data.settings;
    const group = function (title, note) {
      const box = el('div', 'settings-group');
      box.appendChild(el('div', 'settings-group-title', title));
      if (note) box.appendChild(el('div', 'settings-group-note', note));
      const list = el('div', 'settings-list');
      box.appendChild(list);
      body.appendChild(box);
      return list;
    };
    const requests = group('Requests');
    requests.appendChild(settingToggle('Accept friend requests', 'Let other players send you friend requests here and in game.', st.acceptRequests !== false, function (v, input) { saveFriendSetting({ acceptRequests: v }, input); }));
    requests.appendChild(settingToggle('Friend notifications', 'Show a pop-up in game when friends come online or send you a request.', st.toasts !== false, function (v, input) { saveFriendSetting({ toasts: v }, input); }));
    const display = group('Display', 'Not available on 1.21.4, 1.21.5 and 1.21.10.');
    display.appendChild(settingToggle('Friend icon next to names', 'A small icon next to your friends in the tab list and above their heads.', st.showIcon !== false, function (v, input) { saveFriendSetting({ showIcon: v }, input); }));
    const colorOn = st.nameColorEnabled === true;
    display.appendChild(settingToggle('Color friend names', 'Show your friends\' names in a color of your choice.', colorOn, function (v, input) { saveFriendSetting({ nameColorEnabled: v }, input); }));
    if (colorOn) {
      const current = Number.isInteger(st.nameColor) ? st.nameColor : FRIEND_NAME_COLORS[0];
      const row = el('div', 'settings-row color-row');
      row.appendChild(el('div', 'settings-label', 'Name color'));
      const swatches = el('div', 'color-swatches');
      swatches.setAttribute('role', 'radiogroup');
      swatches.setAttribute('aria-label', 'Name color');
      FRIEND_NAME_COLORS.forEach(function (rgb) {
        const hex = '#' + rgb.toString(16).padStart(6, '0');
        const sw = el('button', 'color-swatch');
        sw.type = 'button';
        sw.style.background = hex;
        sw.setAttribute('role', 'radio');
        sw.setAttribute('aria-checked', rgb === current ? 'true' : 'false');
        sw.setAttribute('aria-label', hex);
        sw.title = rgb === current ? 'Selected' : 'Use this color';
        sw.addEventListener('click', function () {
            if (rgb !== current) saveFriendSetting({ nameColor: rgb });
        });
        swatches.appendChild(sw);
      });
      row.appendChild(swatches);
      display.appendChild(row);
    }
    const privacy = group('Privacy');
    privacy.appendChild(settingToggle('Share the server you play on', null, st.shareServer !== false, function (v, input) { saveFriendSetting({ shareServer: v }, input); }));
    privacy.appendChild(settingToggle('Share your game version', null, st.shareVersion !== false, function (v, input) { saveFriendSetting({ shareVersion: v }, input); }));
    body.appendChild(el('p', 'modal-hint friend-settings-foot', 'Only your friends see your status, and only what you share here.'));
  }

  function renderSocials(socials) {
    let row = document.getElementById('socialRow');
    const keys = Object.keys(SOCIAL_RULES).filter(function (k) { return socials && socials[k]; });
    if (!keys.length) {
      if (row) row.remove();
      return;
    }
    if (!row) {
      row = el('div', 'social-row');
      row.id = 'socialRow';
      const anchor = infoEl.querySelector('.stats');
      infoEl.insertBefore(row, anchor);
    }
    row.innerHTML = '';
    keys.forEach(function (k) {
      const a = el('a', 'social-link social-link--' + k);
      a.href = socials[k];
      a.target = '_blank';
      a.rel = 'noopener nofollow ugc';
      a.innerHTML = SOCIAL_RULES[k].icon;
      a.appendChild(document.createTextNode(SOCIAL_RULES[k].label));
      row.appendChild(a);
    });
  }

  function attachOwnerTools(name, isPrivate) {
    if (!auth || !auth.loadToken()) return;
    auth.getPrivacy().then(function (data) {
      if (!data || !(data.accounts || []).some(function (a) { return String(a).toLowerCase() === String(name).toLowerCase(); })) return;
      editData = data;
      const btn = el('button', 'edit-profile-btn');
      btn.type = 'button';
      btn.innerHTML = ICON_GEAR;
      btn.appendChild(document.createTextNode('Edit profile'));
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', openEditModal);
      const host = isPrivate ? stateEl : document.querySelector('#info .name-row');
      if (host) host.appendChild(btn);
      if (window.location.hash === '#settings') openEditModal();
    }).catch(function () {});
  }

  function handleSettingsRoute() {
    document.title = 'Profile settings | Frost Players';
    if (!auth || !auth.loadToken()) {
      auth.login('/settings');
      return;
    }
    auth.getPrivacy().then(function (data) {
      const own = data && data.accounts && data.accounts[0];
      if (own) {
        window.location.replace(window.FrostPlayers.prettyPath(own) + '#settings');
        return;
      }
      showState(ICON_USER_X, 'No Minecraft account linked', 'Sign in to the FrostClient launcher with this Discord account and play once. Your profile shows up here after that.', false);
      editData = data;
      const btn = el('button', 'edit-profile-btn');
      btn.type = 'button';
      btn.innerHTML = ICON_GEAR;
      btn.appendChild(document.createTextNode('Edit profile'));
      btn.addEventListener('click', openEditModal);
      stateEl.appendChild(btn);
      openEditModal();
    }).catch(function (err) {
      if (err && err.expired) {
        auth.login('/settings');
        return;
      }
      showState(ICON_ALERT, 'Couldn’t load your settings', 'Check your connection and try again.', false);
    });
  }

  if (isSettingsRoute) {
    handleSettingsRoute();
    return;
  }

  if (isFriendsRoute) {
    renderFriendsPage();
    return;
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
        setCanonical(data.name);
        attachOwnerTools(data.name, true);
        return;
      }
      if (res.status === 200 && data.ok) return render(data);
      if (res.status === 404 && data.error === 'not_seen') {
        const shown = data.name || rawQuery;
        document.title = shown + ' | Frost Players';
        showState(ICON_USER_X, 'Not on FrostClient yet', 'We haven’t seen ' + shown + ' playing FrostClient so far. Double-check the spelling, or search for someone else.', true);
        return;
      }
      if (res.status === 404) {
        document.title = 'Player not found | Frost Players';
        showState(ICON_USER_X, 'Player not found', /^\d+$/.test(rawQuery) ? 'No FrostClient player has linked and shared this Discord ID.' : 'There’s no Minecraft player called “' + rawQuery + '”. Check the spelling and try again.', true);
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
