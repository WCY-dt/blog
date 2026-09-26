// Update the active state of the Table of Contents (TOC) based on the current scroll position
function tocActiveFor(wrapper) {
  if (!wrapper) return;

  // Get all TOC anchors and header links
  const tocAnchors = wrapper.querySelectorAll('.sidebar__toc-anchor');
  const headerLinks = document.querySelectorAll('#post__content h2, #post__content h3, #post__content h4');
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
  const currentId = headerLinks[currentActiveIdx].id;
  const currentActiveAnchor = Array.from(tocAnchors).find(anchor => decodeURIComponent(anchor.hash.slice(1)) === currentId);
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
    // Scroll only the TOC pane; scrollIntoView also moves the reading viewport.
    const pane = wrapper.querySelector('.sidebar__toc-content');
    if (pane && pane.clientHeight > 0) {
      const anchorRect = currentActiveAnchor.getBoundingClientRect();
      const paneRect = pane.getBoundingClientRect();
      if (anchorRect.top < paneRect.top || anchorRect.bottom > paneRect.bottom) {
        pane.scrollTop += anchorRect.top - paneRect.top - pane.clientHeight / 2;
      }
    }
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
  const href = this.getAttribute('href');
  const target = document.getElementById(decodeURIComponent(href.slice(1)));
  if (!target) {
    console.error('Target not found:', href);
    return;
  }

  const disclosure = this.closest('details.article-toc');
  if (disclosure) disclosure.open = false;
  history.pushState(null, '', href);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });

  // Scroll to the target header smoothly
  const scrollToTarget = () => {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const header = document.querySelector('.header-wrapper');
    const floatingHeader = header && ['sticky', 'fixed'].includes(getComputedStyle(header).position);
    window.scroll({ top: targetPosition - (floatingHeader ? header.offsetHeight : 0) - 24, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  // Handle images loading before the target header
  const imagesBeforeTarget = Array.from(document.querySelectorAll('img')).filter(img =>
    img.getBoundingClientRect().top + window.scrollY < target.getBoundingClientRect().top + window.scrollY
  );
  imagesBeforeTarget.forEach(img => img.addEventListener('load', scrollToTarget, { once: true }));
  scrollToTarget();
  // Late images may move the destination, but must not pull a reader back after
  // they have deliberately started scrolling or interacting elsewhere.
  const cancel = () => {
    imagesBeforeTarget.forEach(img => img.removeEventListener('load', scrollToTarget));
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(event => window.removeEventListener(event, cancel));
  };
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(event => window.addEventListener(event, cancel, { once: true, passive: true }));
  setTimeout(cancel, 10000);
}

// Add click event listeners to TOC anchors
function addTocAnchorListeners(wrapper) {
  if (!wrapper) return;
  wrapper.querySelectorAll('.sidebar__toc-anchor').forEach(anchor => anchor.addEventListener('click', handleAnchorClick));
}
addTocAnchorListeners(document.querySelector('#sidebar__toc-wrapper'));
addTocAnchorListeners(document.querySelector('#sidebar__toc-wrapper-mobile'));

// Native fragment navigation happens before asynchronous math typesetting. Restore
// the initial heading once that layout is ready, unless the reader has taken over.
(() => {
  const initialHash = location.hash;
  if (!initialHash) return;
  let cancelled = false;
  let deadline;
  const inputEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  const cancel = () => {
    cancelled = true;
    clearTimeout(deadline);
    inputEvents.forEach(event => window.removeEventListener(event, cancel));
    window.removeEventListener('hashchange', cancel);
    window.removeEventListener('pagehide', cancel);
  };
  inputEvents.forEach(event => window.addEventListener(event, cancel, { passive: true }));
  window.addEventListener('hashchange', cancel, { once: true });
  window.addEventListener('pagehide', cancel, { once: true });
  // A failed or very slow CDN must never cause a surprise jump much later.
  deadline = setTimeout(cancel, 15000);

  const settle = async () => {
    let id;
    try { id = decodeURIComponent(initialHash.slice(1)); } catch { cancel(); return; }
    const target = document.getElementById(id);
    if (!target?.matches('#post__content h2, #post__content h3, #post__content h4')) {
      cancel();
      return;
    }
    const mathScript = document.getElementById('MathJax-script');
    if (mathScript && !window.MathJax?.startup?.promise) {
      await new Promise(resolve => {
        mathScript.addEventListener('load', resolve, { once: true });
        mathScript.addEventListener('error', resolve, { once: true });
      });
    }
    try {
      await window.MathJax?.startup?.promise;
      await document.fonts?.ready;
    } catch {
      // If typesetting fails, the heading is still a valid native destination.
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (cancelled || location.hash !== initialHash || !target.isConnected) return;
      const header = document.querySelector('.header-wrapper');
      const floatingHeader = header && ['sticky', 'fixed'].includes(getComputedStyle(header).position);
      const top = target.getBoundingClientRect().top + window.scrollY - (floatingHeader ? header.offsetHeight : 0) - 24;
      window.scrollTo({ top, behavior: 'instant' });
      tocActive();
      cancel();
    }));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', settle, { once: true });
  } else {
    settle();
  }
})();
