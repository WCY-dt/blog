function tocActive() {
    let toc = document.querySelector('#toc-container');
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
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function () {
        tocActive();
    });
});
tocActive();

document.querySelectorAll('#toc-container a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        function checkStartWithNumber(str) {
            return str.replace(/#(\d)/g, '#§$1');
        }

        const hrefAttribute = this.getAttribute('href');
        const escapedHref = checkStartWithNumber(decodeURIComponent(hrefAttribute));
        const target = document.querySelector(escapedHref);
        if (!target) {
            console.error('Target not found:', escapedHref);
            return;
        }

        function scrollToTarget() {
            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            const scrollPosition = targetPosition - (window.innerHeight / 3);

            window.scroll({
                top: scrollPosition,
                behavior: 'smooth'
            });
        }

        const imagesBeforeTarget = Array.from(document.querySelectorAll('img')).filter(img => {
            const imgPosition = img.getBoundingClientRect().top + window.scrollY;
            return imgPosition < target.getBoundingClientRect().top + window.scrollY;
        });

        const imagesWithListener = [];

        imagesBeforeTarget.forEach(img => {
            img.addEventListener('load', scrollToTarget);
            imagesWithListener.push(img);
        });

        scrollToTarget();

        setTimeout(() => {
            imagesWithListener.forEach(img => {
                img.removeEventListener('load', scrollToTarget);
            });
        }, 10000);
    });
});

function toggleTOC() {
    let toc = document.querySelector('#toc-container');
    let tocul = toc.querySelector('&>ul');
    let tocButton = document.querySelector('#toc-container button span');
    if (tocul.style.display === 'flex') {
        tocul.style.display = 'none';
        tocButton.innerHTML = 'toc';
    } else {
        tocul.style.display = 'flex';
        tocButton.innerHTML = 'close';
    }
}
tocButton = document.querySelector('#toc-container button');
if (tocButton) {
    tocButton.addEventListener('click', toggleTOC);
}