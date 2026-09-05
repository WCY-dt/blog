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

  function enableColumnResize() {
    document.querySelectorAll('.table-wrapper > table').forEach((table) => {
      const wrapper = table.parentElement;
      // Capture content before resize handles or user-selected widths change it.
      const markdown = window.markdownCopy.table(table);
      const buttons = wrapper.querySelector('.table-buttons');
      buttons.prepend(window.markdownCopy.button(markdown));
      // Keep the toolbar reachable while reading columns to the right.
      wrapper.addEventListener('scroll', () => {
        buttons.style.transform = `translateX(${wrapper.scrollLeft}px)`;
      }, { passive: true });
      wrapper.tabIndex = 0;
      wrapper.setAttribute('aria-label', '表格，可横向滚动');
      const headers = Array.from(table.tHead?.rows[0]?.cells || []);
      // Spanning headers need a different column model; keep their native layout.
      if (!headers.length || table.tHead.rows.length !== 1 || table.querySelector('[colspan], [rowspan], colgroup')) return;
      table.classList.add('table-resizable');
      let columns;
      let widths;
      const minimum = 80;
      const maximum = 1600;

      function prepare() {
        if (columns) return;
        // Measure on interaction so tables inside closed details also work.
        widths = headers.map((header) => header.getBoundingClientRect().width);
        const group = document.createElement('colgroup');
        columns = widths.map(() => group.appendChild(document.createElement('col')));
        table.insertBefore(group, table.tHead);
        table.classList.add('table-resized');
        applyWidths();
      }

      function applyWidths() {
        columns.forEach((col, index) => { col.style.width = `${widths[index]}px`; });
        table.style.width = `${widths.reduce((sum, width) => sum + width, 0)}px`;
        handles.forEach((handle, index) => handle.setAttribute('aria-valuenow', Math.round(widths[index])));
      }

      const handles = headers.map((header, index) => {
        const handle = document.createElement('span');
        handle.className = 'table-column-resizer';
        handle.tabIndex = 0;
        handle.setAttribute('role', 'separator');
        handle.setAttribute('aria-orientation', 'vertical');
        handle.setAttribute('aria-label', `调整“${header.textContent.trim()}”列宽`);
        handle.setAttribute('aria-valuemin', minimum);
        handle.setAttribute('aria-valuemax', maximum);
        handle.setAttribute('aria-valuenow', Math.round(header.getBoundingClientRect().width) || minimum);
        handle.title = '拖动调整列宽；方向键微调；双击恢复默认列宽';
        header.append(handle);
        let drag;

        function change(width) {
          widths[index] = Math.min(maximum, Math.max(minimum, width));
          applyWidths();
        }

        handle.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          prepare();
          handle.focus({ preventScroll: true });
          drag = { x: event.clientX, width: widths[index], pointerId: event.pointerId };
          handle.setPointerCapture(event.pointerId);
          wrapper.classList.add('table-is-resizing');
        });
        handle.addEventListener('pointermove', (event) => {
          if (drag && event.pointerId === drag.pointerId) change(drag.width + event.clientX - drag.x);
        });
        function finish(event) {
          if (!drag || event.pointerId !== drag.pointerId) return;
          drag = null;
          wrapper.classList.remove('table-is-resizing');
          if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
        }
        handle.addEventListener('pointerup', finish);
        handle.addEventListener('pointercancel', finish);
        handle.addEventListener('lostpointercapture', finish);
        handle.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          event.preventDefault();
          prepare();
          change(widths[index] + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 40 : 10));
        });
        handle.addEventListener('dblclick', () => {
          if (!columns) return;
          columns[0].parentElement.remove();
          columns = null;
          widths = null;
          table.classList.remove('table-resized');
          table.style.removeProperty('width');
          handles.forEach((item, column) => item.setAttribute('aria-valuenow', Math.round(headers[column].getBoundingClientRect().width)));
        });
        handle.addEventListener('click', (event) => event.stopPropagation());
        return handle;
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enableColumnResize);
  else enableColumnResize();
})();
