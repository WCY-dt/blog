document.addEventListener('DOMContentLoaded', function() {
  // Initialize file structure trees
  const fileStructureContainers = document.querySelectorAll('.file-structure__container');

  fileStructureContainers.forEach(container => {
    const expandableFolders = container.querySelectorAll('.file-structure__tree-item--expandable');
    const toggleBtn = container.querySelector('.file-structure__toggle');

    expandableFolders.forEach(folder => {
      const content = folder.querySelector('.file-structure__tree-content');
      const children = folder.querySelector('.file-structure__tree-children');

      if (content && children) {
        content.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          // Toggle expanded/collapsed
          folder.classList.toggle('file-structure__tree-children--expanded');
          folder.classList.toggle('file-structure__tree-children--collapsed');

          if (folder.classList.contains('file-structure__tree-children--expanded')) {
            toggleBtn.classList.add('file-structure__toggle--expanded');
            toggleBtn.classList.remove('file-structure__toggle--collapsed');
            toggleBtn.querySelector('span').textContent = 'collapse_all';

            children.classList.remove('file-structure__tree-children--collapsed');
            children.classList.add('file-structure__tree-children--expanded');
          } else {
            children.classList.remove('file-structure__tree-children--expanded');
            children.classList.add('file-structure__tree-children--collapsed');
          }
        });
      }
    });

    // Auto-expand all folders initially
    expandableFolders.forEach(folder => {
      const children = folder.querySelector('.file-structure__tree-children');
      if (children) {
        folder.classList.add('file-structure__tree-children--expanded');
        children.classList.remove('file-structure__tree-children--collapsed');
        children.classList.add('file-structure__tree-children--expanded');
      }
    });

    // Toggle all functionality
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        const isExpanded = toggleBtn.classList.contains('file-structure__toggle--expanded');
        expandableFolders.forEach(folder => {
          const children = folder.querySelector('.file-structure__tree-children');
          if (children) {
            if (isExpanded) {
              // Collapse all
              folder.classList.remove('file-structure__tree-children--expanded');
              folder.classList.add('file-structure__tree-children--collapsed');
              children.classList.remove('file-structure__tree-children--expanded');
              children.classList.add('file-structure__tree-children--collapsed');
            } else {
              // Expand all
              folder.classList.add('file-structure__tree-children--expanded');
              folder.classList.remove('file-structure__tree-children--collapsed');
              children.classList.remove('file-structure__tree-children--collapsed');
              children.classList.add('file-structure__tree-children--expanded');
            }
          }
        });
        // Toggle button state
        toggleBtn.classList.toggle('file-structure__toggle--expanded');
        toggleBtn.classList.toggle('file-structure__toggle--collapsed');
        toggleBtn.querySelector('span').textContent = isExpanded ? 'expand_all' : 'collapse_all';
      });
    }
  });
});
