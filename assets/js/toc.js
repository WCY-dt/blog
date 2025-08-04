// Initialize the TOC functionality
function tocActive() {
  const tocWrapper = document.querySelector('#sidebar__toc-wrapper');
  if (!tocWrapper) return;
  const footerWrapper = document.querySelector('#footer-wrapper');
  if (footerWrapper) {
    const footerWrapperTop = footerWrapper.getBoundingClientRect().top + window.scrollY;
    const halfViewportHeight = window.innerHeight / 2;

    if (footerWrapperTop <= window.scrollY + halfViewportHeight) {
      tocWrapper.style.display = 'none';
      return;
    } else {
      tocWrapper.style.display = '';
    }
  }
  const tocAnchors = tocWrapper.querySelectorAll('.sidebar__toc-anchor');
  const headerLinks = document.querySelectorAll('h2, h3, h4');
  if (headerLinks.length === 0) {
    tocWrapper.style.display = 'none';
    return;
  }
  const headerOffsets = Array.from(headerLinks).map(link => link.getBoundingClientRect().top + window.scrollY);
  const currentScrollPos = window.scrollY + window.innerHeight / 2;
  let currentActiveIdx = 0;
  for (let i = headerOffsets.length - 1; i >= 0; i--) {
    if (currentScrollPos >= headerOffsets[i]) {
      currentActiveIdx = i;
      break;
    }
  }
  tocAnchors.forEach(item => item.classList.remove('sidebar__toc-anchor--active'));
  const currentActiveAnchor = tocAnchors[currentActiveIdx];
  if (currentActiveAnchor) {
    currentActiveAnchor.classList.add('sidebar__toc-anchor--active');
    tocWrapper.querySelectorAll('.sidebar__toc-submenu--expand').forEach(el => el.classList.remove('sidebar__toc-submenu--expand'));
    const nextUl = currentActiveAnchor.nextElementSibling;
    if (nextUl && nextUl.tagName === 'UL') {
      nextUl.classList.add('sidebar__toc-submenu--expand');
    }
    let parentAnchor = currentActiveAnchor;
    while (parentAnchor) {
      if (parentAnchor && parentAnchor.classList && (parentAnchor.classList.contains('sidebar__toc-submenu') || parentAnchor.classList.contains('sidebar__toc-content'))) {
        parentAnchor.classList.add('sidebar__toc-submenu--expand');
        const siblingAnchor = parentAnchor.nextElementSibling;
        if (siblingAnchor && siblingAnchor.classList && (siblingAnchor.classList.contains('sidebar__toc-submenu') || siblingAnchor.classList.contains('sidebar__toc-content'))) {
          siblingAnchor.classList.add('sidebar__toc-submenu--expand');
        }
      }
      parentAnchor = parentAnchor.parentNode;
    }
    currentActiveAnchor.scrollIntoView({ behavior: 'smooth' });
  }
}
['scroll', 'resize', 'load'].forEach(event => window.addEventListener(event, tocActive));
document.querySelectorAll('img').forEach(img => img.addEventListener('load', tocActive));
tocActive();

// Handle anchor clicks in the TOC
function handleAnchorClick(e) {
  e.preventDefault();
  const href = this.getAttribute('href').replace(/#(\d)/g, '#§$1');
  const target = document.querySelector(decodeURIComponent(href));
  if (!target) {
    console.error('Target not found:', href);
    return;
  }
  const scrollToTarget = () => {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scroll({ top: targetPosition - window.innerHeight / 3, behavior: 'smooth' });
  };
  const imagesBeforeTarget = Array.from(document.querySelectorAll('img')).filter(img =>
    img.getBoundingClientRect().top + window.scrollY < target.getBoundingClientRect().top + window.scrollY
  );
  imagesBeforeTarget.forEach(img => img.addEventListener('load', scrollToTarget));
  scrollToTarget();
  setTimeout(() => imagesBeforeTarget.forEach(img => img.removeEventListener('load', scrollToTarget)), 10000);
}
document.querySelectorAll('.sidebar__toc-anchor').forEach(anchor => anchor.addEventListener('click', handleAnchorClick));

// toggle TOC button on mobile
function toggleToc() {
  const tocContent = document.querySelector('.sidebar__toc-content');
  const tocButton = document.querySelector('#sidebar__toc-btn');
  const isTocVisible = tocContent.style.display === 'flex';
  tocContent.style.display = isTocVisible ? 'none' : 'flex';
  tocButton.innerHTML = isTocVisible ? 'toc' : 'close';
}
document.querySelector('#sidebar__toc-btn')?.addEventListener('click', toggleToc);
