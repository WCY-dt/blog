// Update the active state of the Table of Contents (TOC) based on the current scroll position
function tocActiveFor(wrapper) {
  if (!wrapper) return;

  // Hide TOC if the footer is visible
  const footerWrapper = document.querySelector('#footer-wrapper');
  if (footerWrapper) {
    const footerWrapperTop = footerWrapper.getBoundingClientRect().top + window.scrollY;
    const halfViewportHeight = window.innerHeight / 2;
    if (footerWrapperTop <= window.scrollY + halfViewportHeight) {
      wrapper.style.display = 'none';
      return;
    } else {
      wrapper.style.display = '';
    }
  }

  // Get all TOC anchors and header links
  const tocAnchors = wrapper.querySelectorAll('.sidebar__toc-anchor');
  const headerLinks = document.querySelectorAll('h2, h3, h4');
  if (headerLinks.length === 0) {
    wrapper.style.display = 'none';
    return;
  }

  // Calculate header offsets and determine the currently active header
  const headerOffsets = Array.from(headerLinks).map(link => link.getBoundingClientRect().top + window.scrollY);
  const currentScrollPos = window.scrollY + window.innerHeight / 2;
  let currentActiveIdx = 0;
  for (let i = headerOffsets.length - 1; i >= 0; i--) {
    if (currentScrollPos >= headerOffsets[i]) {
      currentActiveIdx = i;
      break;
    }
  }

  // Update the active state of TOC anchors
  tocAnchors.forEach(item => item.classList.remove('sidebar__toc-anchor--active'));
  const currentActiveAnchor = tocAnchors[currentActiveIdx];
  if (currentActiveAnchor) {
    currentActiveAnchor.classList.add('sidebar__toc-anchor--active');

    // Expand submenus for the active anchor
    wrapper.querySelectorAll('.sidebar__toc-submenu--expand').forEach(el => el.classList.remove('sidebar__toc-submenu--expand'));
    const nextUl = currentActiveAnchor.nextElementSibling;
    if (nextUl && nextUl.tagName === 'UL') {
      nextUl.classList.add('sidebar__toc-submenu--expand');
    }

    // Expand parent submenus
    let parentAnchor = currentActiveAnchor;
    while (parentAnchor) {
      if (parentAnchor.classList && (parentAnchor.classList.contains('sidebar__toc-submenu') || parentAnchor.classList.contains('sidebar__toc-content'))) {
        parentAnchor.classList.add('sidebar__toc-submenu--expand');
        const siblingAnchor = parentAnchor.nextElementSibling;
        if (siblingAnchor && siblingAnchor.classList && (siblingAnchor.classList.contains('sidebar__toc-submenu') || siblingAnchor.classList.contains('sidebar__toc-content'))) {
          siblingAnchor.classList.add('sidebar__toc-submenu--expand');
        }
      }
      parentAnchor = parentAnchor.parentNode;
    }

    // Scroll the active anchor into view
    currentActiveAnchor.scrollIntoView({ behavior: 'smooth' });
  }
}

// Update TOC for both desktop and mobile views
function tocActive() {
  tocActiveFor(document.querySelector('#sidebar__toc-wrapper'));
  tocActiveFor(document.querySelector('#sidebar__toc-wrapper-mobile'));
}

// Add event listeners for scroll, resize, and load events
['scroll', 'resize', 'load'].forEach(event => window.addEventListener(event, tocActive));
document.querySelectorAll('img').forEach(img => img.addEventListener('load', tocActive));
tocActive();

// Handle anchor clicks in the TOC (desktop & mobile)
function handleAnchorClick(e) {
  e.preventDefault();
  const href = this.getAttribute('href').replace(/#(\d)/g, '#§$1');
  const target = document.querySelector(decodeURIComponent(href));
  if (!target) {
    console.error('Target not found:', href);
    return;
  }

  // Scroll to the target header smoothly
  const scrollToTarget = () => {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scroll({ top: targetPosition - window.innerHeight / 3, behavior: 'smooth' });
  };

  // Handle images loading before the target header
  const imagesBeforeTarget = Array.from(document.querySelectorAll('img')).filter(img =>
    img.getBoundingClientRect().top + window.scrollY < target.getBoundingClientRect().top + window.scrollY
  );
  imagesBeforeTarget.forEach(img => img.addEventListener('load', scrollToTarget));
  scrollToTarget();
  setTimeout(() => imagesBeforeTarget.forEach(img => img.removeEventListener('load', scrollToTarget)), 10000);
}

// Add click event listeners to TOC anchors
function addTocAnchorListeners(wrapper) {
  if (!wrapper) return;
  wrapper.querySelectorAll('.sidebar__toc-anchor').forEach(anchor => anchor.addEventListener('click', handleAnchorClick));
}
addTocAnchorListeners(document.querySelector('#sidebar__toc-wrapper'));
addTocAnchorListeners(document.querySelector('#sidebar__toc-wrapper-mobile'));

// Toggle TOC visibility (desktop & mobile)
function toggleToc(event) {
  const button = event.target;
  const wrapper = button.closest('.sidebar__toc-wrapper');
  if (!wrapper) return;
  const tocContent = wrapper.querySelector('.sidebar__toc-content');
  if (!tocContent) return;

  // Toggle the display state of the TOC content
  const isTocVisible = tocContent.style.display === 'flex';
  tocContent.style.display = isTocVisible ? 'none' : 'flex';
  button.innerHTML = isTocVisible ? 'toc' : 'close';
  button.classList.toggle('sidebar__toc-btn--active', !isTocVisible);
}

// Add event listeners to TOC toggle buttons
document.querySelector('#sidebar__toc-btn')?.addEventListener('click', toggleToc);
document.querySelector('#sidebar__toc-btn-mobile')?.addEventListener('click', toggleToc);
