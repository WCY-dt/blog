document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.file-structure__container').forEach(container => {
    const folders = [...container.querySelectorAll('.file-structure__tree-item--expandable')];
    const toggle = container.querySelector('.file-structure__toggle');
    const expandedClass = 'file-structure__tree-children--expanded';
    const collapsedClass = 'file-structure__tree-children--collapsed';

    function makeButton(element, action) {
      element.setAttribute('role', 'button');
      element.tabIndex = 0;
      element.addEventListener('click', action);
      element.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        action();
      });
    }

    function setExpanded(folder, expanded) {
      const content = folder.querySelector(':scope > .file-structure__tree-content');
      const children = folder.querySelector(':scope > .file-structure__tree-children');
      if (!content || !children) return;
      for (const element of [folder, children]) {
        element.classList.toggle(expandedClass, expanded);
        element.classList.toggle(collapsedClass, !expanded);
      }
      children.hidden = !expanded;
      content.setAttribute('aria-expanded', String(expanded));
    }

    function updateToggle() {
      if (!toggle) return;
      const anyExpanded = folders.some(folder => folder.classList.contains(expandedClass));
      toggle.classList.toggle('file-structure__toggle--expanded', anyExpanded);
      toggle.classList.toggle('file-structure__toggle--collapsed', !anyExpanded);
      window.articleTools.label(toggle, anyExpanded ? '折叠全部文件夹' : '展开全部文件夹');
      const icon = toggle.querySelector('span');
      if (icon) {
        icon.textContent = anyExpanded ? 'collapse_all' : 'expand_all';
        icon.setAttribute('aria-hidden', 'true');
      }
    }

    folders.forEach(folder => {
      const content = folder.querySelector(':scope > .file-structure__tree-content');
      if (!content) return;
      makeButton(content, () => {
        setExpanded(folder, !folder.classList.contains(expandedClass));
        updateToggle();
      });
      setExpanded(folder, true);
    });

    if (toggle) makeButton(toggle, () => {
      const expand = !folders.some(folder => folder.classList.contains(expandedClass));
      folders.forEach(folder => setExpanded(folder, expand));
      updateToggle();
    });
    updateToggle();
  });
});
