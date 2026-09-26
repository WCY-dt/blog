(() => {
  const wrapper = document.querySelector('#comment-wrapper');
  const config = wrapper?.querySelector('#comment-config');
  const status = wrapper?.querySelector('.comment-status');
  if (!config || !status) return;
  const message = status.querySelector('.comment-status-text');
  const retry = status.querySelector('button');
  const fallback = status.querySelector('.comment-fallback');
  const container = wrapper.querySelector('.giscus');
  const origin = 'https://giscus.app';
  const frames = new WeakSet();
  const sentThemes = new WeakMap();
  let timeout;
  let ready = false;
  let fatal = false;
  let started = false;
  let theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

  const themeUrl = () => new URL(wrapper.dataset[theme === 'dark' ? 'themeDark' : 'themeLight'], location.href).href;
  function syncTheme() {
    const url = themeUrl();
    wrapper.querySelector('[data-giscus-loader]')?.setAttribute('data-theme', url);
    const frame = container.querySelector('.giscus-frame');
    if (frame?.contentWindow && sentThemes.get(frame) !== url) {
      frame.contentWindow.postMessage({ giscus: { setConfig: { theme: url } } }, origin);
      sentThemes.set(frame, url);
    }
  }
  window.setCommentTheme = currentTheme => {
    theme = currentTheme === 'dark' ? 'dark' : 'light';
    syncTheme();
  };

  function fail(force = false) {
    if (ready && !force) return;
    fatal = fatal || force;
    clearTimeout(timeout);
    ready = false;
    wrapper.dataset.state = 'error';
    container.setAttribute('aria-busy', 'false');
    status.hidden = false;
    message.textContent = '评论暂时未能加载，可以重试或前往讨论区。';
    retry.hidden = false;
    retry.disabled = false;
    fallback.hidden = false;
  }
  function complete() {
    ready = true;
    clearTimeout(timeout);
    wrapper.dataset.state = 'ready';
    container.setAttribute('aria-busy', 'false');
    status.hidden = true;
    retry.disabled = false;
    syncTheme();
  }
  function connect() {
    const frame = container.querySelector('.giscus-frame');
    if (!frame || frames.has(frame)) return;
    frames.add(frame);
    frame.title = '文章评论';
    frame.addEventListener('error', () => fail());
    frame.addEventListener('load', () => {
      // A load event can also be an error document. Await Giscus' own message.
      sentThemes.delete(frame);
      syncTheme();
    });
  }
  new MutationObserver(connect).observe(container, { childList: true, subtree: true });
  window.addEventListener('message', event => {
    const frame = container.querySelector('.giscus-frame');
    if (event.origin !== origin || !frame || event.source !== frame.contentWindow) return;
    const data = event.data?.giscus;
    if (!data || typeof data !== 'object') return;
    // An absent discussion is normal; Giscus handles expired sessions itself.
    if (typeof data.error === 'string' && !/Discussion not found|Bad credentials|Invalid state value|State has expired/.test(data.error)) {
      fail(true);
      return;
    }
    if (!fatal && Number.isFinite(data.resizeHeight) && data.resizeHeight > 0) complete();
  });

  function start() {
    started = true;
    ready = false;
    fatal = false;
    clearTimeout(timeout);
    wrapper.dataset.state = 'loading';
    container.setAttribute('aria-busy', 'true');
    status.hidden = false;
    message.textContent = '正在加载评论…';
    retry.hidden = true;
    retry.disabled = true;
    fallback.hidden = true;
    timeout = setTimeout(() => fail(), 20000);
    const frame = container.querySelector('.giscus-frame');
    if (frame) {
      const url = new URL(frame.src);
      url.searchParams.set('theme', themeUrl());
      sentThemes.delete(frame);
      frame.src = url.href;
      return;
    }
    wrapper.querySelector('[data-giscus-loader]')?.remove();
    const script = document.createElement('script');
    script.setAttribute('data-cfasync', 'false');
    for (const { name, value } of config.content.querySelector('script').attributes) {
      // CDN optimizers may rewrite an inert template's type. Copy only config,
      // never their execution markers or synthetic script type.
      if ((name.startsWith('data-') && !name.startsWith('data-cf')) || ['src', 'crossorigin', 'async', 'referrerpolicy'].includes(name)) {
        script.setAttribute(name, value);
      }
    }
    // Set the theme before the asynchronous client can construct its iframe.
    script.setAttribute('data-theme', themeUrl());
    script.addEventListener('error', () => fail(), { once: true });
    wrapper.append(script);
  }
  retry.addEventListener('click', start);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!started && entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { rootMargin: '200px' });
    observer.observe(wrapper);
  } else {
    start();
  }
})();
