/**
 * Result Plugin JavaScript
 * Handles fullscreen, refresh, and tab switching
 */

// Each source block is a keyboard-operable tab set; controls describe their action.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.result').forEach(preview => {
    const tabs = [...preview.querySelectorAll('.result-tab')];
    const tablist = preview.querySelector('.result-tab-buttons__tabs');
    tablist?.setAttribute('role', 'tablist');
    tablist?.setAttribute('aria-label', '示例源码');
    function select(button) {
      tabs.forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = preview.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    }
    tabs.forEach((tab, index) => {
      const panel = preview.querySelector(`[data-tab-content="${tab.dataset.tab}"]`);
      tab.id = `${preview.id}-tab-${index}`;
      panel.id = `${preview.id}-panel-${index}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[next]);
        tabs[next].focus();
      });
    });
    if (tabs.length) select(tabs.find(tab => tab.classList.contains('active')) || tabs[0]);
    preview.querySelectorAll('button[title]').forEach(button => window.articleTools.label(button, button.title));
    preview.querySelectorAll('.result-restore-btn').forEach(button => {
      const caption = document.createElement('span');
      caption.className = 'tool-label';
      caption.textContent = button.getAttribute('aria-label');
      button.append(caption);
      // Its action is already written out; repeating it in a tooltip adds noise.
      button.removeAttribute('data-tooltip');
    });
    syncResultPanels(preview);
  });
  updateRestoreButtonIcons();
});

function syncResultPanels(preview) {
  const source = preview.querySelector('.result__source');
  const output = preview.querySelector('.result__preview');
  for (const [type, panel, other] of [['source', source, output], ['preview', output, source]]) {
    const hidden = panel.classList.contains('hidden');
    panel.id = `${preview.id}-${type}`;
    panel.setAttribute('aria-hidden', String(hidden));
    panel.inert = hidden;
    const restore = preview.querySelector(`.result-restore-btn--${type}`);
    restore.style.display = hidden ? 'flex' : 'none';
    restore.setAttribute('aria-controls', panel.id);
    restore.setAttribute('aria-expanded', String(!hidden));
    panel.querySelectorAll('.result-toggle-btn').forEach(button => {
      button.style.display = other.classList.contains('hidden') ? 'none' : '';
      button.setAttribute('aria-controls', panel.id);
      button.setAttribute('aria-expanded', String(!hidden));
    });
  }
}

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
        if (verticalIcon) icon.innerHTML = window.articleTools.arrow(verticalIcon.replace('keyboard_arrow_', ''));
      } else {
        const layoutIcon = layout === 'vertical'
          ? btn.getAttribute('data-icon-vertical')
          : btn.getAttribute('data-icon-horizontal');
        if (layoutIcon) icon.innerHTML = window.articleTools.arrow(layoutIcon.replace('keyboard_arrow_', ''));
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
    const button = preview.querySelector('.result-refresh-btn');
    window.articleTools.reloadFrame(iframe, button, '重新加载预览', () => iframe.setAttribute('srcdoc', src));
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
    document.body.style.overflow = wrapper.dataset.previousOverflow || '';
  } else {
    wrapper.dataset.previousOverflow = document.body.style.overflow;
    wrapper.classList.add('fullscreen');
    document.body.style.overflow = 'hidden';
    if (btn) btn.textContent = 'close_fullscreen';
  }
  const button = wrapper.querySelector('.result-fullscreen-btn');
  window.articleTools.label(button, wrapper.classList.contains('fullscreen') ? '退出全屏 · Esc' : '全屏显示预览');
  button?.setAttribute('aria-pressed', String(wrapper.classList.contains('fullscreen')));
  button?.focus({ preventScroll: true });
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
  syncResultPanels(preview);
  const panel = panelType === 'source' ? sourcePanel : previewPanel;
  const focus = panel.classList.contains('hidden') ? (panelType === 'source' ? restoreBtnSource : restoreBtnPreview) : panel.querySelector('[role="tab"][aria-selected="true"]') || panel.querySelector('button');
  focus?.focus({ preventScroll: true });
}

// Handle ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
    const fullscreenPreview = document.querySelector('.result-wrapper.fullscreen');
    if (fullscreenPreview) {
      const previewId = fullscreenPreview.querySelector('.result').id;
      toggleResultFullscreen(previewId);
    }
  }
});
