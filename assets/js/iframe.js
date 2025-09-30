// Iframe Plugin JavaScript Functions

function toggleIframeFullscreen(iframeId) {
  const iframe = document.getElementById(iframeId);
  if (!iframe) return;

  const container = iframe.closest('.iframe-container');
  if (!container) return;

  const isFullscreen = container.classList.contains('fullscreen');

  if (isFullscreen) {
    // Exit fullscreen
    container.classList.remove('fullscreen');
    document.body.style.overflow = '';

    // Update button icon
    const btn = container.querySelector('.iframe-fullscreen-btn .material-symbols-outlined');
    if (btn) {
      btn.textContent = 'open_in_full';
      btn.parentElement.title = 'Fullscreen';
    }

    // Remove escape key listener
    document.removeEventListener('keydown', window.iframeEscapeHandler);
  } else {
    // Enter fullscreen
    container.classList.add('fullscreen');
    document.body.style.overflow = 'hidden';

    // Update button icon
    const btn = container.querySelector('.iframe-fullscreen-btn .material-symbols-outlined');
    if (btn) {
      btn.textContent = 'close_fullscreen';
      btn.parentElement.title = 'Exit Fullscreen';
    }

    // Add escape key listener
    window.iframeEscapeHandler = function(e) {
      if (e.key === 'Escape') {
        toggleIframeFullscreen(iframeId);
      }
    };
    document.addEventListener('keydown', window.iframeEscapeHandler);
  }
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

// Exit fullscreen when clicking outside the iframe container
document.addEventListener('click', function(e) {
  const fullscreenContainer = document.querySelector('.iframe-container.fullscreen');
  if (fullscreenContainer && !fullscreenContainer.contains(e.target)) {
    const iframe = fullscreenContainer.querySelector('iframe');
    if (iframe) {
      toggleIframeFullscreen(iframe.id);
    }
  }
});

// Prevent clicks inside fullscreen container from bubbling up
document.addEventListener('click', function(e) {
  if (e.target.closest('.iframe-container.fullscreen')) {
    e.stopPropagation();
  }
});
