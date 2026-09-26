// Directional controls share the feature arrow, including changing fullscreen states.
(() => {
  if (!window.articleTools) return;
  const path = '<path d="M10 38 38 10M10 10h28v28" fill="none" stroke="currentColor" stroke-width="2.5"/>';
  const utilityPaths = {
    content_copy: '<rect x="8" y="7" width="11" height="14"/><path d="M15 7V3H4v14h4"/>',
    refresh: '<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',
    format_paragraph: '<path d="M20 5H9a4 4 0 0 0 0 8h3M12 5v15M17 5v15"/>',
  };
  function update(icon) {
    const name = icon.textContent.trim();
    if (utilityPaths[name]) icon.innerHTML = `<svg class="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${utilityPaths[name]}</svg>`;
    else if (name === 'open_in_new') icon.innerHTML = window.articleTools.arrow();
    else if (name.startsWith('keyboard_arrow_')) icon.innerHTML = window.articleTools.arrow(name.replace('keyboard_arrow_', ''));
    else if (name === 'open_in_full' || name === 'close_fullscreen') {
      const inward = name === 'close_fullscreen';
      icon.innerHTML = `<svg class="site-arrow tool-icon tool-icon--fullscreen" viewBox="0 0 48 48" aria-hidden="true"><g transform="translate(20 0) scale(.58)${inward ? ' rotate(180 24 24)' : ''}">${path}</g><g transform="translate(0 20) scale(.58) rotate(${inward ? 0 : 180} 24 24)">${path}</g></svg>`;
    }
  }
  document.querySelectorAll('.material-symbols-outlined').forEach(update);
  new MutationObserver(records => {
    const icons = new Set();
    for (const record of records) {
      const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
      const icon = target?.closest('.material-symbols-outlined');
      if (icon) icons.add(icon);
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches('.material-symbols-outlined')) icons.add(node);
        node.querySelectorAll('.material-symbols-outlined').forEach(item => icons.add(item));
      }
    }
    icons.forEach(update);
  }).observe(document.body, { childList:true, subtree:true, characterData:true });
})();
