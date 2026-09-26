/* Shared action names and feedback for article instruments. */
(() => {
  const timers = new WeakMap();
  function label(button, text) {
    if (!button) return;
    button.setAttribute('aria-label', text);
    if (button.hasAttribute('data-copy-link')) button.removeAttribute('data-tooltip');
    else button.dataset.tooltip = text;
    button.removeAttribute('title');
    button.querySelectorAll('.material-symbols-outlined').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
  }
  function feedback(button, text, state, original, visible = '复制') {
    hide();
    clearTimeout(timers.get(button));
    label(button, text);
    button.dataset.state = state;
    const caption = button.querySelector('.tool-label');
    if (caption) caption.textContent = text;
    let status = button.parentElement.querySelector('.tool-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'tool-status sr-only';
      status.setAttribute('role', 'status');
      button.parentElement.append(status);
    }
    status.textContent = text;
    timers.set(button, setTimeout(() => {
      delete button.dataset.state;
      label(button, original);
      if (caption) caption.textContent = visible;
      status.textContent = '';
    }, 2200));
  }
  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return; }
      catch (_) { /* Legacy copy remains useful when permission is unavailable. */ }
    }
    const focused = document.activeElement;
    const selection = window.getSelection();
    const ranges = Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange());
    const input = document.createElement('textarea');
    input.value = text;
    input.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none';
    const surface = document.querySelector('dialog[open]') || document.querySelector(fullscreenSelector) || document.body;
    surface.append(input);
    try {
      input.focus({ preventScroll: true });
      input.select();
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
    } finally {
      input.remove();
      focused?.focus({ preventScroll: true });
      selection.removeAllRanges();
      ranges.forEach(range => selection.addRange(range));
    }
  }
  // One recovery path for embedded examples: loading must never strand a button.
  function reloadFrame(frame, button, original, reload) {
    if (!frame || !button || button.disabled) return;
    clearTimeout(timers.get(button));
    button.disabled = true;
    button.dataset.state = 'loading';
    label(button, '正在重新加载…');
    const header = button.closest('.iframe-header, .result__preview-header');
    let message = header?.nextElementSibling;
    if (header && !message?.classList.contains('component-feedback')) {
      message = document.createElement('p');
      message.className = 'component-feedback';
      message.setAttribute('role', 'status');
      header.insertAdjacentElement('afterend', message);
    }
    if (message?.classList.contains('component-feedback')) { message.hidden = true; message.dataset.state = 'loading'; message.textContent = ''; }
    frame.setAttribute('aria-busy', 'true');
    let timer;
    const finish = success => {
      clearTimeout(timer);
      frame.removeEventListener('load', loaded);
      frame.removeEventListener('error', failed);
      frame.removeAttribute('aria-busy');
      button.disabled = false;
      feedback(button, success ? '已重新加载' : '加载未完成，请重试', success ? 'success' : 'error', original);
      if (!success && message?.classList.contains('component-feedback')) {
        message.textContent = '加载未完成，可以使用重新加载按钮再试一次。';
        message.dataset.state = 'error';
        message.hidden = false;
      }
    };
    const loaded = () => {
      try {
        const local = frame.hasAttribute('srcdoc') || new URL(frame.src, location.href).origin === location.origin;
        if (local && (!frame.contentDocument?.body || frame.contentDocument.documentURI === 'about:blank')) return finish(false);
      } catch (_) { return finish(false); }
      finish(true);
    };
    const failed = () => finish(false);
    frame.addEventListener('load', loaded, { once: true });
    frame.addEventListener('error', failed, { once: true });
    timer = setTimeout(failed, 15000);
    try { reload(); } catch (_) { failed(); }
  }
  function arrow(direction = '') {
    return `<svg class="site-arrow${direction ? ' site-arrow--' + direction : ''}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false"><path d="M10 38 38 10M10 10h28v28" stroke="currentColor" stroke-width="2.5"/></svg>`;
  }
  window.articleTools = { label, feedback, copy, reloadFrame, arrow };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-copy-link]').forEach(button => {
      button.addEventListener('click', async () => {
        try { await copy(button.dataset.copyLink); feedback(button, '链接已复制', 'success', '复制文章链接', '复制链接'); }
        catch (_) { feedback(button, '复制失败', 'error', '复制文章链接', '复制链接'); }
      });
    });
    document.querySelectorAll('.cite__link').forEach(link => label(link, '查看引用来源'));
    document.querySelectorAll('.github-issue__link').forEach(link => label(link, '查看 GitHub 讨论'));
    document.querySelectorAll('.result__iframe, .iframe-container iframe').forEach(frame => {
      const documents = new WeakSet();
      const connect = () => {
        try {
          const child = frame.contentDocument;
          if (!child || documents.has(child)) return;
          documents.add(child);
          child.addEventListener('keydown', event => {
            if (event.key === 'Escape' && frame.closest('.fullscreen')) {
              event.preventDefault();
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }
          });
        } catch (_) { /* Cross-origin content retains its browser keyboard behavior. */ }
      };
      frame.addEventListener('load', connect);
      connect();
    });
  });
  const tooltip = document.createElement('div');
  tooltip.className = 'tool-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let current;
  const hide = () => { tooltip.hidden = true; current = null; };
  const show = button => {
    if (!button || button.disabled) return hide();
    current = button;
    tooltip.textContent = button.dataset.tooltip;
    tooltip.hidden = false;
    const rect = button.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    tooltip.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, rect.left + (rect.width - width) / 2))}px`;
    tooltip.style.top = `${rect.top > height + 16 ? rect.top - height - 8 : rect.bottom + 8}px`;
  };
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const button = event.target.closest('[data-tooltip]');
    if (button !== current) show(button);
  });
  document.addEventListener('pointerout', event => {
    if (current && !current.contains(event.relatedTarget)) hide();
  });
  const fullscreenSelector = '.code-block-wrapper.fullscreen, .table-wrapper.fullscreen, .result-wrapper.fullscreen, .iframe-container.fullscreen, .code-runner__container.fullscreen';
  document.addEventListener('focusin', event => {
    const fullscreen = document.querySelector(fullscreenSelector);
    if (fullscreen && !document.querySelector('dialog[open]') && !fullscreen.contains(event.target)) {
      fullscreen.querySelector('button:not([disabled])')?.focus();
      return;
    }
    show(event.target.closest('[data-tooltip]'));
  });
  document.addEventListener('focusout', hide);
  document.addEventListener('click', hide);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  document.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || document.querySelector('dialog[open]')) return;
    const fullscreen = document.querySelector(fullscreenSelector);
    if (!fullscreen) return;
    const controls = [...fullscreen.querySelectorAll('button, a[href], input, textarea, select, iframe, [tabindex]')].filter(element => !element.disabled && element.tabIndex >= 0 && !element.closest('[inert]') && element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !fullscreen.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !fullscreen.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });
})();
