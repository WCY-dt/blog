/**
 * Result Plugin JavaScript
 * Handles fullscreen, refresh, and tab switching
 */

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
  // Handle tab clicks
  document.querySelectorAll('.result-tab').forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      const tabsContainer = this.closest('.result-tabs');

      // Remove active class from all tabs and contents
      tabsContainer.querySelectorAll('.result-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      tabsContainer.querySelectorAll('.result-tab-content').forEach(content => {
        content.classList.remove('active');
      });

      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      tabsContainer.querySelector(`.result-tab-content[data-tab-content="${tabName}"]`).classList.add('active');
    });
  });

  // Handle initial hidden state - hide toggle buttons for the opposite panel
  document.querySelectorAll('.result').forEach(preview => {
    const sourcePanel = preview.querySelector('.result__source');
    const previewPanel = preview.querySelector('.result__preview');
    const sourceToggleBtns = sourcePanel.querySelectorAll('.result-toggle-btn');
    const previewToggleBtns = previewPanel.querySelectorAll('.result-toggle-btn');

    if (sourcePanel.classList.contains('hidden')) {
      // If source is hidden initially, hide preview's toggle buttons
      previewToggleBtns.forEach(btn => btn.style.display = 'none');
    }

    if (previewPanel.classList.contains('hidden')) {
      // If preview is hidden initially, hide source's toggle buttons
      sourceToggleBtns.forEach(btn => btn.style.display = 'none');
    }
  });

  // Handle responsive icon changes
  updateRestoreButtonIcons();
});

// Update restore button icons based on screen size
function updateRestoreButtonIcons() {
  const isSmallScreen = window.innerWidth <= 768;

  document.querySelectorAll('.result').forEach(preview => {
    const layout = preview.getAttribute('data-layout');
    const restoreBtns = preview.querySelectorAll('.result-restore-btn');

    restoreBtns.forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (!icon) return;

      // On small screens, always use vertical icons
      // On large screens, use the layout-specific icons
      if (isSmallScreen) {
        const verticalIcon = btn.getAttribute('data-icon-vertical');
        if (verticalIcon) icon.textContent = verticalIcon;
      } else {
        const layoutIcon = layout === 'vertical'
          ? btn.getAttribute('data-icon-vertical')
          : btn.getAttribute('data-icon-horizontal');
        if (layoutIcon) icon.textContent = layoutIcon;
      }
    });
  });
}

// Update icons on window resize
window.addEventListener('resize', updateRestoreButtonIcons);

// Refresh iframe content
function refreshResult(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const iframe = preview.querySelector('.result__iframe');
  if (iframe) {
    const src = iframe.getAttribute('srcdoc');
    iframe.setAttribute('srcdoc', '');
    setTimeout(() => {
      iframe.setAttribute('srcdoc', src);
    }, 10);
  }
}

// Toggle fullscreen mode
function toggleResultFullscreen(previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const wrapper = preview.closest('.result-wrapper');
  if (!wrapper) return;

  const btn = wrapper.querySelector('.result-fullscreen-btn .material-symbols-outlined');

  if (wrapper.classList.contains('fullscreen')) {
    wrapper.classList.remove('fullscreen');
    if (btn) btn.textContent = 'open_in_full';
  } else {
    wrapper.classList.add('fullscreen');
    if (btn) btn.textContent = 'close_fullscreen';
  }
}

// Toggle code or preview panel visibility
function toggleResultPanel(previewId, panelType) {
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const sourcePanel = preview.querySelector('.result__source');
  const previewPanel = preview.querySelector('.result__preview');
  const divider = preview.querySelector('.result__divider');
  const restoreBtnSource = preview.querySelector('.result-restore-btn--source');
  const restoreBtnPreview = preview.querySelector('.result-restore-btn--preview');

  // Get toggle buttons from both panels
  const sourceToggleBtns = sourcePanel.querySelectorAll('.result-toggle-btn');
  const previewToggleBtns = previewPanel.querySelectorAll('.result-toggle-btn');

  if (panelType === 'source') {
    const isHidden = sourcePanel.classList.contains('hidden');

    if (isHidden) {
      // Show source panel
      sourcePanel.classList.remove('hidden');
      if (divider && !previewPanel.classList.contains('hidden')) divider.style.display = '';
      // Hide restore button after the panel is shown
      if (restoreBtnSource) restoreBtnSource.style.display = 'none';

      // Show preview panel's toggle buttons again
      previewToggleBtns.forEach(btn => btn.style.display = '');
    } else {
      // Prevent hiding if preview panel is already hidden
      if (previewPanel.classList.contains('hidden')) {
        return;
      }

      // Hide source panel
      sourcePanel.classList.add('hidden');
      if (divider) divider.style.display = 'none';
      // Show restore button after the panel is hidden
      if (restoreBtnSource) restoreBtnSource.style.display = 'flex';

      // Hide preview panel's toggle buttons
      previewToggleBtns.forEach(btn => btn.style.display = 'none');
    }
  } else if (panelType === 'preview') {
    const isHidden = previewPanel.classList.contains('hidden');

    if (isHidden) {
      // Show preview panel
      previewPanel.classList.remove('hidden');
      if (divider && !sourcePanel.classList.contains('hidden')) divider.style.display = '';
      // Hide restore button after the panel is shown
      if (restoreBtnPreview) restoreBtnPreview.style.display = 'none';

      // Show source panel's toggle buttons again
      sourceToggleBtns.forEach(btn => btn.style.display = '');
    } else {
      // Prevent hiding if source panel is already hidden
      if (sourcePanel.classList.contains('hidden')) {
        return;
      }

      // Hide preview panel
      previewPanel.classList.add('hidden');
      if (divider) divider.style.display = 'none';
      // Show restore button after the panel is hidden
      if (restoreBtnPreview) restoreBtnPreview.style.display = 'flex';

      // Hide source panel's toggle buttons
      sourceToggleBtns.forEach(btn => btn.style.display = 'none');
    }
  }
}

// Handle ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const fullscreenPreview = document.querySelector('.result-wrapper.fullscreen');
    if (fullscreenPreview) {
      const previewId = fullscreenPreview.querySelector('.result').id;
      toggleResultFullscreen(previewId);
    }
  }
});
