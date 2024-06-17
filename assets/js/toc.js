function tocActive() {
    let toc = document.querySelector('.toc');
    if (!toc) {
        return;
    }
    let tocItems = toc.querySelectorAll('a');

    let headerLinks = document.querySelectorAll('h2, h3, h4, h5, h6');

    let headerLinksOffset = Array.from(headerLinks).map(function (link) {
        return link.getBoundingClientRect().top + window.scrollY;
    });

    let headerLinksOffsetBottom = Array.from(headerLinks).map(function (link) {
        return link.getBoundingClientRect().bottom + window.scrollY;
    });

    let headerLinksOffsetLength = headerLinksOffset.length;

    let headerLinksOffsetIndex = 0;

    for (let i = 0; i < headerLinksOffsetLength; i++) {
        if (headerLinksOffset[i] < window.scrollY + window.innerHeight / 2) {
            headerLinksOffsetIndex = i;
        }
    }

    for (let _i = 0; _i < tocItems.length; _i++) {
        tocItems[_i].classList.remove('active');
    }

    let activeItem = tocItems[headerLinksOffsetIndex];

    if (!activeItem) {
        return;
    }
    activeItem.classList.add('active');

    toc.querySelectorAll('.expand').forEach(function (el) {
        el.classList.remove('expand');
    });
    let nextSibling = activeItem.nextSibling;
    if (nextSibling && nextSibling.tagName === 'UL') {
        nextSibling.classList.add('expand');
    }
    let parent = activeItem.parentNode;
    while (parent) {
        if (parent.tagName === 'UL') {
            parent.classList.add('expand');
        }
        parent = parent.parentNode;
    }

    activeItem.scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('scroll', tocActive);
window.addEventListener('resize', tocActive);
window.addEventListener('load', tocActive);
tocActive();

document.querySelectorAll('.toc a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const scrollPosition = targetPosition - (window.innerHeight / 3);

        window.scroll({
            top: scrollPosition,
            behavior: 'smooth'
        });
    });
});

function toggleTOC() {
    let toc = document.querySelector('.toc');
    let tocul = toc.querySelector('&>ul');
    let tocButton = document.querySelector('.toc button span');
    if (tocul.style.display === 'flex') {
        tocul.style.display = 'none';
        tocButton.innerHTML = 'toc';
    } else {
        tocul.style.display = 'flex';
        tocButton.innerHTML = 'close';
    }
}
tocButton = document.querySelector('.toc button');
if (tocButton) {
    tocButton.addEventListener('click', toggleTOC);
}