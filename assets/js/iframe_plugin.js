// Iframe Plugin JavaScript Functions

function refreshIframe(iframeId) {
  const iframe = document.getElementById(iframeId);
  if (iframe) {
    const button = iframe.closest('.iframe-container').querySelector('.iframe-refresh-btn');
    window.articleTools.reloadFrame(iframe, button, '重新加载演示', () => { iframe.src = iframe.src; });
  }
}

function toggleIframeFullscreen(iframeId) {
  const iframe = document.getElementById(iframeId);
  if (!iframe) return;

  const container = iframe.closest('.iframe-container');
  if (!container) return;

  const isFullscreen = container.classList.contains('fullscreen');

  if (isFullscreen) {
    // Exit fullscreen
    container.classList.remove('fullscreen');
    document.body.style.overflow = container.dataset.previousOverflow || '';

    // Update button icon
    const btn = container.querySelector('.iframe-fullscreen-btn .material-symbols-outlined');
    if (btn) {
      btn.textContent = 'open_in_full';
      window.articleTools.label(btn.parentElement, '全屏显示演示');
      btn.parentElement.setAttribute('aria-pressed', 'false');
    }

    // Remove escape key listener
    document.removeEventListener('keydown', window.iframeEscapeHandler);
  } else {
    // Enter fullscreen
    container.classList.add('fullscreen');
    container.dataset.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Update button icon
    const btn = container.querySelector('.iframe-fullscreen-btn .material-symbols-outlined');
    if (btn) {
      btn.textContent = 'close_fullscreen';
      window.articleTools.label(btn.parentElement, '退出全屏 · Esc');
      btn.parentElement.setAttribute('aria-pressed', 'true');
    }

    // Add escape key listener
    window.iframeEscapeHandler = function(e) {
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        toggleIframeFullscreen(iframeId);
      }
    };
    document.addEventListener('keydown', window.iframeEscapeHandler);
  }
  container.querySelector('.iframe-fullscreen-btn')?.focus({ preventScroll: true });
}

// Handle page visibility change to exit fullscreen when tab becomes hidden
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    const fullscreenContainers = document.querySelectorAll('.iframe-container.fullscreen');
    fullscreenContainers.forEach(container => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        toggleIframeFullscreen(iframe.id);
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.iframe-controls button[title]').forEach(button => window.articleTools.label(button, button.title));
});
