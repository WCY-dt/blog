/* Reading positions stay in this browser; no account or network request is involved. */
(() => {
  'use strict';
  const KEY = 'blog:reading-positions:v1';
  const TTL = 30 * 24 * 60 * 60 * 1000;
  const LIMIT = 30;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function readRecords() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(data)) return [];
      const now = Date.now();
      return data.filter(item => item && typeof item.path === 'string' &&
        Number.isFinite(item.updatedAt) && now - item.updatedAt < TTL && item.updatedAt <= now &&
        Number.isFinite(item.progress) && item.progress > 0 && item.progress < 1 &&
        Number.isFinite(item.offset) && item.offset >= 0 &&
        typeof item.anchor === 'string' && typeof item.label === 'string')
        .sort((a, b) => b.updatedAt - a.updatedAt).slice(0, LIMIT);
    } catch (_) { return []; }
  }

  function init() {
    const article = document.getElementById('post__content');
    const notice = document.getElementById('reading-resume');
    if (!article || !notice || notice.dataset.initialized) return;
    notice.dataset.initialized = 'true';
    const path = location.pathname.replace(/\/$/, '') || '/';
    let saved = readRecords().find(item => item.path === path);
    let active = false;
    let completed = false;
    let timer;
    let adjustment;
    let adjustmentTimer;
    let lastY = window.scrollY;
    let lastInput = 0;
    let pendingScroll = false;
    let restoring = false;
    const started = Date.now();
    const headings = Array.from(article.querySelectorAll('h2[id], h3[id], h4[id]'));
    const yOf = element => element.getBoundingClientRect().top + window.scrollY;
    const geometry = () => ({ top:yOf(article), height:article.getBoundingClientRect().height });
    const longEnough = height => height >= Math.max(1800, window.innerHeight * 3);
    const inset = () => {
      const header = document.querySelector('.header-wrapper');
      return header && ['fixed', 'sticky'].includes(getComputedStyle(header).position)
        ? Math.max(0, header.getBoundingClientRect().bottom) + 24 : 24;
    };

    function store(record) {
      try {
        const records = readRecords().filter(item => item.path !== path);
        if (record) records.unshift(record);
        if (records.length) localStorage.setItem(KEY, JSON.stringify(records.slice(0, LIMIT)));
        else localStorage.removeItem(KEY);
      } catch (_) { /* Private mode, quota limits and disabled storage remain silent. */ }
    }

    function hide() {
      if (notice.hidden) return;
      const before = yOf(article);
      const preserve = window.scrollY > before;
      notice.hidden = true;
      if (preserve) window.scrollBy({ top:yOf(article) - before, behavior:'instant' });
    }

    function stopAdjustment() {
      adjustment?.disconnect();
      adjustment = null;
      clearTimeout(adjustmentTimer);
      restoring = false;
    }

    function focus(element) {
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
        element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once:true });
      }
      element.focus({ preventScroll:true });
    }

    function save() {
      clearTimeout(timer);
      timer = undefined;
      if (!pendingScroll || !active || completed || restoring || Date.now() - started < 1200) return;
      pendingScroll = false;
      const { top, height } = geometry();
      if (!longEnough(height)) return;
      const position = window.scrollY + inset();
      const offset = position - top;
      // Returning to the title must not erase a useful position deeper in the article.
      if (offset < Math.max(400, window.innerHeight * .65)) return;
      if (window.scrollY + window.innerHeight >= top + height - 24) {
        completed = true;
        saved = undefined;
        store(null);
        hide();
        return;
      }
      const anchor = headings.filter(heading => yOf(heading) <= position + 1).pop();
      const index = headings.indexOf(anchor);
      const anchorTop = anchor ? yOf(anchor) : top;
      const nextTop = index >= 0 && headings[index + 1] ? yOf(headings[index + 1]) : top + height;
      const within = Math.max(0, position - anchorTop);
      saved = {
        path, anchor:anchor?.id || '', offset:within,
        sectionRatio:clamp(within / Math.max(1, nextTop - anchorTop), 0, 1),
        width:article.clientWidth, progress:clamp(offset / height, .001, .999),
        label:anchor?.textContent.replace(/\s+/g, ' ').trim().slice(0, 100) || '',
        updatedAt:Date.now()
      };
      store(saved);
      hide();
    }

    function targetPosition(record) {
      const { top, height } = geometry();
      const anchor = record.anchor && document.getElementById(record.anchor);
      if (anchor && article.contains(anchor)) {
        const index = headings.indexOf(anchor);
        const anchorTop = yOf(anchor);
        const nextTop = index >= 0 && headings[index + 1] ? yOf(headings[index + 1]) : top + height;
        const sectionHeight = Math.max(0, nextTop - anchorTop - 1);
        const responsive = Number.isFinite(record.width) && Math.abs(record.width - article.clientWidth) > 100;
        const offset = responsive && Number.isFinite(record.sectionRatio)
          ? clamp(record.sectionRatio, 0, 1) * sectionHeight : record.offset;
        return anchorTop + Math.min(offset, sectionHeight) - inset();
      }
      return top + height * record.progress - inset();
    }

    notice.querySelector('[data-reading-continue]').addEventListener('click', () => {
      if (!saved) return;
      const record = saved;
      hide();
      restoring = true;
      const jump = () => window.scrollTo({ top:Math.max(0, targetPosition(record)), behavior:'instant' });
      const anchor = record.anchor && document.getElementById(record.anchor);
      const focusTarget = anchor && article.contains(anchor) ? anchor : article;
      focus(focusTarget);
      jump();
      // Briefly follow images/diagrams that finish loading above the restored section.
      // Any reader input immediately ends this correction window.
      if ('ResizeObserver' in window) {
        adjustment = new ResizeObserver(jump);
        adjustment.observe(article);
      }
      adjustmentTimer = setTimeout(stopAdjustment, 1800);
    });
    notice.querySelector('[data-reading-dismiss]').addEventListener('click', () => {
      saved = undefined;
      pendingScroll = false;
      store(null);
      hide();
      focus(article);
    });

    function userInput(event) {
      if (event.type === 'keydown' && !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
      active = true;
      lastInput = Date.now();
      stopAdjustment();
    }
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(type => window.addEventListener(type, userInput, { passive:true }));
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (Math.abs(current - lastY) > 2 && active && !restoring && Date.now() - lastInput < 10000) {
        pendingScroll = true;
        if (!timer) timer = setTimeout(save, 700);
      }
      lastY = current;
    }, { passive:true });
    window.addEventListener('pagehide', () => { save(); stopAdjustment(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
    window.addEventListener('hashchange', () => { stopAdjustment(); hide(); });
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      lastY = window.scrollY;
      active = false;
      pendingScroll = false;
      hide();
    });

    const { top, height } = geometry();
    // Hash links and native browser restoration already have a destination.
    if (saved && !location.hash && longEnough(height) && window.scrollY <= top + 32) {
      notice.querySelector('[data-reading-position]').textContent = saved.label || `正文 ${Math.round(saved.progress * 100)}%`;
      notice.hidden = false;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
