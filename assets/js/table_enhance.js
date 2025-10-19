(function () {
  'use strict';

  // Show table buttons by setting their opacity to 1
  window.showTableButtons = function (tableId) {
    const buttons = document.querySelector('#wrapper-' + tableId + ' .table-buttons');
    if (buttons) {
      buttons.style.opacity = '1';
    }
  };

  // Hide table buttons by setting their opacity to 0, unless the table is in fullscreen mode
  window.hideTableButtons = function (tableId) {
    const buttons = document.querySelector('#wrapper-' + tableId + ' .table-buttons');
    if (buttons) {
      const wrapper = document.getElementById('wrapper-' + tableId);
      if (wrapper && !wrapper.classList.contains('fullscreen')) {
        buttons.style.opacity = '0';
      }
    }
  };

  // Toggle fullscreen mode for the table
  window.toggleTableFullscreen = function (tableId) {
    const wrapper = document.getElementById('wrapper-' + tableId);
    const fullscreenBtn = document.getElementById('fullscreen-btn-' + tableId);

    if (!wrapper || !fullscreenBtn) {
      return;
    }

    const icon = fullscreenBtn.querySelector('.material-symbols-outlined');

    if (wrapper.classList.contains('fullscreen')) {
      // Exit fullscreen mode
      wrapper.classList.remove('fullscreen');
      icon.textContent = 'open_in_full';
      fullscreenBtn.title = 'Toggle Fullscreen';
      document.body.style.overflow = '';
    } else {
      // Enter fullscreen mode
      wrapper.classList.add('fullscreen');
      icon.textContent = 'close_fullscreen';
      fullscreenBtn.title = 'Exit Fullscreen';
      document.body.style.overflow = 'hidden';
    }
  };

  // Exit fullscreen mode when the ESC key is pressed
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const fullscreenWrapper = document.querySelector('.table-wrapper.fullscreen');
      if (fullscreenWrapper) {
        const tableId = fullscreenWrapper.id.replace('wrapper-', '');
        toggleTableFullscreen(tableId);
      }
    }
  });

  // Exit fullscreen mode when clicking outside the table
  document.addEventListener('click', function (e) {
    const fullscreenWrapper = document.querySelector('.table-wrapper.fullscreen');
    if (fullscreenWrapper && !fullscreenWrapper.contains(e.target)) {
      const tableId = fullscreenWrapper.id.replace('wrapper-', '');
      toggleTableFullscreen(tableId);
    }
  });

})();
