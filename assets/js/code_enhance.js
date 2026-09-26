(() => {
  'use strict';
  const { label, feedback, copy } = window.articleTools;
  const previousOverflow = new WeakMap();
  window.toggleCodeFullscreen = function (codeId) {
    const wrapper = document.getElementById('wrapper-' + codeId);
    const button = document.getElementById('fullscreen-btn-' + codeId);
    if (!wrapper || !button) return;
    const active = !wrapper.classList.contains('fullscreen');
    if (active) previousOverflow.set(wrapper, document.body.style.overflow);
    wrapper.classList.toggle('fullscreen', active);
    document.body.style.overflow = active ? 'hidden' : previousOverflow.get(wrapper) || '';
    button.querySelector('.material-symbols-outlined').textContent = active ? 'close_fullscreen' : 'open_in_full';
    label(button, active ? '退出全屏 · Esc' : '全屏显示代码');
    button.setAttribute('aria-pressed', String(active));
    button.focus({ preventScroll: true });
  };
  window.copyCode = async function (codeId) {
    const code = document.getElementById(codeId);
    const button = document.getElementById('copy-btn-' + codeId);
    if (!code || !button) return;
    try {
      await copy(code.textContent);
      feedback(button, '已复制', 'success', '复制代码');
    } catch (_) {
      feedback(button, '复制失败', 'error', '复制代码');
    }
  };
  document.addEventListener('keydown', event => {
    const wrapper = document.querySelector('.code-block-wrapper.fullscreen');
    if (event.key === 'Escape' && wrapper && !document.querySelector('dialog[open]')) window.toggleCodeFullscreen(wrapper.id.replace('wrapper-', ''));
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-copy-button').forEach(button => {
      label(button, '复制代码');
      button.addEventListener('click', () => window.copyCode(button.id.replace('copy-btn-', '')));
    });
    document.querySelectorAll('.code-white-space-button').forEach(button => {
      const code = document.getElementById(button.id.replace('whitespace-btn-', ''));
      const sync = () => {
        const active = code.classList.contains('word-wrap-enabled');
        label(button, active ? '关闭自动换行' : '自动换行');
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
      };
      sync();
      button.addEventListener('click', () => { code.classList.toggle('word-wrap-enabled'); sync(); });
    });
    document.querySelectorAll('.code-fullscreen-button').forEach(button => {
      label(button, '全屏显示代码');
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => window.toggleCodeFullscreen(button.id.replace('fullscreen-btn-', '')));
    });
  });
})();
