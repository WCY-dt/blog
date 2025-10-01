/**
 * Code Preview Plugin JavaScript
 * Handles fullscreen, refresh, and tab switching
 */

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
  // Handle tab clicks
  document.querySelectorAll('.code-preview-tab').forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      const tabsContainer = this.closest('.code-preview-tabs');

      // Remove active class from all tabs and contents
      tabsContainer.querySelectorAll('.code-preview-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      tabsContainer.querySelectorAll('.code-preview-tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      tabsContainer.querySelector(`.code-preview-tab-content[data-tab-content="${tabName}"]`).classList.add('active');
    });
  });
});

// Refresh iframe content
function refreshCodePreview(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const iframe = preview.querySelector('.code-preview__iframe');
  if (iframe) {
    const src = iframe.getAttribute('srcdoc');
    iframe.setAttribute('srcdoc', '');
    setTimeout(() => {
      iframe.setAttribute('srcdoc', src);
    }, 10);
  }
}

// Toggle fullscreen mode
function toggleCodePreviewFullscreen(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const wrapper = preview.closest('.code-preview-wrapper');
  if (!wrapper) return;

  const btn = wrapper.querySelector('.code-preview-fullscreen-btn .material-symbols-outlined');

  if (wrapper.classList.contains('fullscreen')) {
    wrapper.classList.remove('fullscreen');
    if (btn) btn.textContent = 'open_in_full';
  } else {
    wrapper.classList.add('fullscreen');
    if (btn) btn.textContent = 'close_fullscreen';
  }
}

// Handle ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const fullscreenPreview = document.querySelector('.code-preview-wrapper.fullscreen');
    if (fullscreenPreview) {
      const previewId = fullscreenPreview.querySelector('.code-preview').id;
      toggleCodePreviewFullscreen(previewId);
    }
  }
});
