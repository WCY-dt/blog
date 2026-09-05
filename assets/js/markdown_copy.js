(function () {
  'use strict';

  async function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_) { /* Try the legacy copy path when clipboard access is denied. */ }
    }
    const focused = document.activeElement;
    const selection = window.getSelection();
    const ranges = Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange());
    const input = document.createElement('textarea');
    input.value = text;
    input.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none';
    document.body.append(input);
    try {
      input.focus({ preventScroll: true });
      input.select();
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
    } finally {
      input.remove();
      focused?.focus({ preventScroll: true });
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
  }

  function copyButton(markdown) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'markdown-copy-button';
    button.title = '复制 Markdown';
    button.setAttribute('aria-label', button.title);
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'content_copy';
    button.append(icon);
    let timer;
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(timer);
      try {
        await writeClipboard(markdown);
        icon.textContent = 'check';
        button.title = '已复制 Markdown';
      } catch (_) {
        icon.textContent = 'error_outline';
        button.title = '复制失败，请重试';
      }
      button.setAttribute('aria-label', button.title);
      timer = setTimeout(() => {
        icon.textContent = 'content_copy';
        button.title = '复制 Markdown';
        button.setAttribute('aria-label', button.title);
      }, 2000);
    });
    return button;
  }

  function inline(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.replace(/\s+/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const content = () => Array.from(node.childNodes, inline).join('');
    switch (node.tagName) {
      case 'BR': return '<br>';
      case 'STRONG': case 'B': return `**${content()}**`;
      case 'EM': case 'I': return `*${content()}*`;
      case 'DEL': case 'S': return `~~${content()}~~`;
      case 'CODE': {
        const text = node.textContent.replace(/\r?\n/g, ' ');
        const fence = '`'.repeat(Math.max(0, ...(text.match(/`+/g) || []).map((run) => run.length)) + 1);
        const pad = /^`|`$|^ .* $/.test(text) && !/^ +$/.test(text) ? ' ' : '';
        return `${fence}${pad}${text}${pad}${fence}`;
      }
      case 'A': {
        const href = node.getAttribute('href');
        if (!href) return content();
        const destination = href.replace(/ /g, '%20').replace(/</g, '%3C').replace(/>/g, '%3E');
        const title = node.getAttribute('title');
        return `[${content()}](<${destination}>${title ? ` "${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : ''})`;
      }
      case 'IMG': {
        const alt = (node.getAttribute('alt') || '').replace(/([\\\[\]])/g, '\\$1');
        const src = (node.getAttribute('src') || '').replace(/ /g, '%20').replace(/</g, '%3C').replace(/>/g, '%3E');
        return `![${alt}](<${src}>)`;
      }
      case 'P': return `${content()}<br>`;
      case 'SPAN': return content();
      default: return node.outerHTML.replace(/\r?\n/g, ' ');
    }
  }

  function tableMarkdown(table) {
    // Markdown has no merged cells; embedded HTML preserves those tables.
    if (table.querySelector('[colspan], [rowspan], table') || table.tHead?.rows.length > 1) return table.outerHTML;
    const rows = Array.from(table.rows);
    if (!rows.length) return '';
    const count = Math.max(...rows.map((row) => row.cells.length));
    const line = (cells) => `| ${Array.from({ length: count }, (_, index) => cells[index] || '').join(' | ')} |`;
    const cellText = (cell) => Array.from(cell.childNodes, inline).join('').trim().replace(/\|/g, '\\|');
    const header = table.tHead?.rows[0] || (rows[0].querySelector('th') ? rows[0] : null);
    const alignment = Array.from({ length: count }, (_, index) => {
      const cell = (header || rows[0]).cells[index];
      const align = cell?.style.textAlign || cell?.getAttribute('align');
      return { left: ':---', center: ':---:', right: '---:' }[align] || '---';
    });
    return [
      line(header ? Array.from(header.cells, cellText) : []),
      line(alignment),
      ...rows.filter((row) => row !== header).map((row) => line(Array.from(row.cells, cellText))),
    ].join('\n');
  }

  window.markdownCopy = { button: copyButton, table: tableMarkdown };
})();
