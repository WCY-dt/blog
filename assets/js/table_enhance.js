(function () {
  'use strict';

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
      window.articleTools.label(fullscreenBtn, '全屏显示表格');
      fullscreenBtn.setAttribute('aria-pressed', 'false');
      document.body.style.overflow = wrapper.dataset.previousOverflow || '';
    } else {
      // Enter fullscreen mode
      wrapper.classList.add('fullscreen');
      wrapper.dataset.previousOverflow = document.body.style.overflow;
      icon.textContent = 'close_fullscreen';
      window.articleTools.label(fullscreenBtn, '退出全屏 · Esc');
      fullscreenBtn.setAttribute('aria-pressed', 'true');
      document.body.style.overflow = 'hidden';
    }
    fullscreenBtn.focus({ preventScroll: true });
  };

  // Exit fullscreen mode when the ESC key is pressed
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
      const fullscreenWrapper = document.querySelector('.table-wrapper.fullscreen');
      if (fullscreenWrapper) {
        const tableId = fullscreenWrapper.id.replace('wrapper-', '');
        toggleTableFullscreen(tableId);
      }
    }
  });

  function enableColumnResize() {
    document.querySelectorAll('.table-wrapper .table-scroll > table').forEach((table) => {
      const scrollport = table.parentElement;
      const wrapper = scrollport.parentElement;
      // Capture content before resize handles or user-selected widths change it.
      const markdown = window.markdownCopy.table(table);
      const buttons = wrapper.querySelector('.table-buttons');
      buttons.insertBefore(window.markdownCopy.button(markdown, { iconOnly: true }), buttons.querySelector('button'));
      window.articleTools.label(buttons.querySelector('.table-fullscreen-button'), '全屏显示表格');
      const note = buttons.querySelector('.component-note');
      const updateOverflow = () => {
        const overflowing = table.scrollWidth > scrollport.clientWidth + 2;
        if (note) note.hidden = !overflowing;
        wrapper.classList.toggle('table-overflowing', overflowing);
        wrapper.classList.toggle('table-scrolled', scrollport.scrollLeft > 2);
        scrollport.setAttribute('aria-label', overflowing ? '表格，可左右滚动查看' : '表格');
      };
      // Controls remain reachable in the table's visible upper-right corner.
      scrollport.addEventListener('scroll', updateOverflow, { passive: true });
      new ResizeObserver(updateOverflow).observe(scrollport);
      updateOverflow();
      const headers = Array.from(table.tHead?.rows[0]?.cells || []);
      // Spanning headers need a different column model; keep their native layout.
      if (!headers.length || table.tHead.rows.length !== 1 || table.querySelector('[colspan], [rowspan], colgroup')) return;
      table.classList.add('table-resizable');
      let columns;
      let widths;
      const minimum = 80;
      const maximum = 1600;
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'table-reset-width';
      reset.hidden = true;
      reset.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/></svg>';
      window.articleTools.label(reset, '恢复默认列宽');
      buttons.insertBefore(reset, buttons.querySelector('button'));
      const originalWidth = table.style.width;
      function resetWidths() {
        if (!columns) return;
        columns[0].parentElement.remove();
        columns = null;
        widths = null;
        table.classList.remove('table-resized');
        table.style.width = originalWidth;
        reset.hidden = true;
        handles.forEach((item, column) => item.setAttribute('aria-valuenow', Math.round(headers[column].getBoundingClientRect().width)));
        updateOverflow();
      }
      reset.addEventListener('click', () => {
        resetWidths();
        scrollport.focus({ preventScroll: true });
      });

      function prepare() {
        if (columns) return;
        reset.hidden = false;
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
        updateOverflow();
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
        handle.title = '拖动或方向键调整列宽；Home 恢复默认';
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
          if (event.key === 'Home') { event.preventDefault(); resetWidths(); return; }
          if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
          event.preventDefault();
          prepare();
          change(widths[index] + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 40 : 10));
        });
        handle.addEventListener('dblclick', resetWidths);
        handle.addEventListener('click', (event) => event.stopPropagation());
        return handle;
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enableColumnResize);
  else enableColumnResize();
})();
