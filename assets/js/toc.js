function tocActive() {
    const toc = document.querySelector('#toc-container');
    if (!toc) return;

    const tocItems = toc.querySelectorAll('a');
    const headerLinks = document.querySelectorAll('h2, h3, h4');

    if (headerLinks.length === 0) {
        toc.style.display = 'none';
        return;
    }

    const headerOffsets = Array.from(headerLinks).map(link => link.getBoundingClientRect().top + window.scrollY);
    const activeIndex = headerOffsets.findIndex(offset => offset >= window.scrollY + window.innerHeight / 2) - 1;

    tocItems.forEach(item => item.classList.remove('active'));
    const activeItem = tocItems[Math.max(activeIndex, 0)];
    if (!activeItem) return;

    activeItem.classList.add('active');
    toc.querySelectorAll('.expand').forEach(el => el.classList.remove('expand'));

    let parent = activeItem;
    while (parent) {
        if (parent.tagName === 'UL') {
            parent.classList.add('expand');
            const siblingUl = parent.nextElementSibling;
            if (siblingUl && siblingUl.tagName === 'UL') {
                siblingUl.classList.add('expand');
            }
        }
        parent = parent.parentNode;
    }

    activeItem.scrollIntoView({ behavior: 'smooth' });
}

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

function toggleTOC() {
    const toc = document.querySelector('#toc-container');
    const tocul = toc.querySelector(':scope > ul'); // Fixed selector
    const tocButton = document.querySelector('#toc-container button span');

    const isVisible = tocul.style.display === 'flex';
    tocul.style.display = isVisible ? 'none' : 'flex';
    tocButton.innerHTML = isVisible ? 'toc' : 'close';
}

document.querySelectorAll('#toc-container a').forEach(anchor => anchor.addEventListener('click', handleAnchorClick));
document.querySelector('#toc-container button')?.addEventListener('click', toggleTOC);

['scroll', 'resize', 'load'].forEach(event => window.addEventListener(event, tocActive));
document.querySelectorAll('img').forEach(img => img.addEventListener('load', tocActive));
tocActive();
