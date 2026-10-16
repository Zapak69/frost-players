(function () {
  const auth = window.FrostPlayersAuth;
  const DROPDOWN_LIMIT = 5;
  const ICON_FRIENDS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function normUuid(uuid) {
    return String(uuid || '').replace(/-/g, '').toLowerCase();
  }

  function headUrl(uuid) {
    return 'https://mc-heads.net/avatar/' + normUuid(uuid) + '/64';
  }

  function profileUrl(name) {
    return (window.FrostPlayers && window.FrostPlayers.prettyPath(name)) || ('/player?nick=' + encodeURIComponent(name));
  }

  function statusText(friend) {
    if (!friend.online) return 'Offline';
    return friend.server ? 'Playing on ' + friend.server : 'Online';
  }

  function sortFriends(list) {
    return (list || []).slice().sort(function (a, b) {
      return (b.online ? 1 : 0) - (a.online ? 1 : 0) || String(a.name).localeCompare(String(b.name), 'en', { sensitivity: 'base' });
    });
  }

  function confirmDialog(title, text, confirmLabel) {
    return new Promise(function (resolve) {
      const overlay = el('div', 'modal-overlay');
      const dialog = el('div', 'modal modal--confirm');
      dialog.setAttribute('role', 'alertdialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.appendChild(el('h2', 'confirm-title', title));
      dialog.appendChild(el('p', 'confirm-text', text));
      const actions = el('div', 'confirm-actions');
      const cancel = el('button', 'btn-ghost', 'Cancel');
      cancel.type = 'button';
      const ok = el('button', 'btn-danger', confirmLabel);
      ok.type = 'button';
      actions.appendChild(cancel);
      actions.appendChild(ok);
      dialog.appendChild(actions);
      overlay.appendChild(dialog);
      const done = function (value) {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(value);
      };
      const onKey = function (e) {
          if (e.key === 'Escape') done(false);
      };
      cancel.addEventListener('click', function () { done(false); });
      ok.addEventListener('click', function () { done(true); });
      overlay.addEventListener('mousedown', function (e) {
          if (e.target === overlay) done(false);
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(overlay);
      ok.focus();
    });
  }

  function removeFriend(friend) {
    return confirmDialog('Remove ' + friend.name + '?', friend.name + ' will be removed from your friend list, in game too. You can send a new request later.', 'Remove').then(function (yes) {
      if (!yes) return null;
      return auth.friendAction('remove', { uuid: friend.uuid });
    });
  }

  function friendRow(friend, opts) {
    const row = el('div', 'friend-row' + (friend.online ? ' is-online' : ''));
    const link = el('a', 'friend-main');
    link.href = profileUrl(friend.name);
    const head = el('img', 'friend-head');
    head.src = headUrl(friend.uuid);
    head.alt = '';
    head.loading = 'lazy';
    link.appendChild(head);
    const text = el('span', 'friend-text');
    text.appendChild(el('span', 'friend-name', friend.name));
    text.appendChild(el('span', 'friend-status', opts && opts.status ? opts.status : statusText(friend)));
    link.appendChild(text);
    row.appendChild(link);
    return row;
  }

  function iconButton(cls, label, icon) {
    const b = el('button', cls);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = icon;
    return b;
  }

  function buildNav() {
    const right = document.querySelector('.nav-right');
    if (!right || !auth || !auth.loadToken() || document.getElementById('navFriends')) return null;
    const wrap = el('div', 'nav-friends');
    wrap.id = 'navFriends';
    const btn = el('button', 'nav-friends-btn');
    btn.type = 'button';
    btn.innerHTML = ICON_FRIENDS;
    btn.setAttribute('aria-label', 'Friends');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    const badge = el('span', 'nav-friends-badge');
    badge.hidden = true;
    btn.appendChild(badge);
    const panel = el('div', 'friends-dropdown');
    panel.hidden = true;
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    const account = document.getElementById('navAccount');
    right.insertBefore(wrap, account && account.parentNode === right ? account : right.firstChild);
    let closeTimer = null;
    let pinned = false;
    const open = function () {
      clearTimeout(closeTimer);
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    };
    const close = function () {
      pinned = false;
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    };
    wrap.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) open();
    });
    wrap.addEventListener('mouseleave', function () {
      if (pinned) return;
      closeTimer = setTimeout(close, 180);
    });
    btn.addEventListener('click', function () {
      if (panel.hidden || !pinned) {
        pinned = true;
        open();
      } else close();
    });
    document.addEventListener('mousedown', function (e) {
        if (!panel.hidden && !wrap.contains(e.target) && !e.target.closest('.modal-overlay')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden && !document.querySelector('.modal-overlay:not([hidden])')) {
        close();
        btn.focus();
      }
    });
    return { panel: panel, badge: badge };
  }

  function renderDropdown(nav, data) {
    const panel = nav.panel;
    panel.innerHTML = '';
    const head = el('div', 'friends-dropdown-head');
    head.appendChild(el('span', 'friends-dropdown-title', 'Friends'));
    if (data && data.friends) {
      const online = data.friends.filter(function (f) { return f.online; }).length;
      head.appendChild(el('span', 'friends-dropdown-count', online + ' online'));
    }
    panel.appendChild(head);
    if (!data || data.error === 'no_account') {
      panel.appendChild(el('p', 'friends-empty', 'Play FrostClient once with this Discord account to use friends.'));
      nav.badge.hidden = true;
      return;
    }
    const incoming = data.incoming || [];
    nav.badge.hidden = !incoming.length;
    nav.badge.textContent = incoming.length > 9 ? '9+' : String(incoming.length);
    if (incoming.length) {
      const req = el('a', 'friends-requests-link', incoming.length === 1 ? '1 friend request' : incoming.length + ' friend requests');
      req.href = '/friends';
      panel.appendChild(req);
    }
    const friends = sortFriends(data.friends);
    if (!friends.length) {
      panel.appendChild(el('p', 'friends-empty', 'No friends yet. Open a player profile and press Add friend.'));
    }
    const list = el('div', 'friends-dropdown-list');
    friends.slice(0, DROPDOWN_LIMIT).forEach(function (friend) {
      const row = friendRow(friend);
      const remove = iconButton('friend-remove', 'Remove ' + friend.name, ICON_X);
      remove.addEventListener('click', function () {
        removeFriend(friend).catch(function () {});
      });
      row.appendChild(remove);
      list.appendChild(row);
    });
    panel.appendChild(list);
    const all = el('a', 'friends-all-link', friends.length > DROPDOWN_LIMIT ? 'All friends (' + friends.length + ')' : 'All friends');
    all.href = '/friends';
    panel.appendChild(all);
  }

  function init() {
    const nav = buildNav();
    if (!nav) return;
    renderDropdown(nav, null);
    auth.getFriends().then(function (data) {
        renderDropdown(nav, data);
    }).catch(function () {});
    document.addEventListener('frost-friends', function (e) {
        renderDropdown(nav, e.detail);
    });
  }

  window.FrostFriends = { confirmDialog: confirmDialog, removeFriend: removeFriend, friendRow: friendRow, iconButton: iconButton, sortFriends: sortFriends, normUuid: normUuid, statusText: statusText, ICON_X: ICON_X };
  document.addEventListener('DOMContentLoaded', init);
})();
