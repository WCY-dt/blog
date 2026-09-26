document.addEventListener('DOMContentLoaded', () => {
  const article = document.getElementById('post__content');
  article?.querySelectorAll('.footnotes').forEach(notes => {
    // Let keyboard users focus and scroll the endnotes without changing anchors.
    notes.setAttribute('tabindex', '0');
    notes.setAttribute('aria-label', '脚注');
  });
  const references = article?.querySelectorAll('a.footnote[href^="#"]');
  article?.querySelectorAll('a.reversefootnote').forEach(link => {
    const repeat = link.querySelector('sup')?.textContent || '';
    link.setAttribute('aria-label', `返回脚注引用${repeat}`);
    link.innerHTML = window.articleTools.arrow('up') + (repeat ? `<sup>${repeat}</sup>` : '');
  });
  if (!references?.length) return;

  const preview = document.createElement('aside');
  preview.id = 'footnote-preview';
  preview.className = 'footnote-preview';
  preview.hidden = true;
  preview.setAttribute('role', 'dialog');
  preview.setAttribute('aria-labelledby', 'footnote-preview-title');
  preview.innerHTML = `
    <div class="footnote-preview__header">
      <span id="footnote-preview-title"></span>
      <button type="button" class="footnote-preview__close" aria-label="关闭脚注预览">×</button>
    </div>
    <div class="footnote-preview__content" tabindex="0"></div>
    <a class="footnote-preview__source">查看文末脚注 ${window.articleTools.arrow()}</a>
  `;
  // Mount outside the article wrapper, whose overflow would clip the preview.
  document.body.appendChild(preview);
  const title = preview.querySelector('#footnote-preview-title');
  const content = preview.querySelector('.footnote-preview__content');
  const source = preview.querySelector('.footnote-preview__source');
  let activeReference = null;
  let closeTimer;
  let pointerType = '';
  let restoringFocus = false;

  function hide(restoreFocus = false) {
    clearTimeout(closeTimer);
    if (!activeReference) return;
    const reference = activeReference;
    activeReference = null;
    preview.hidden = true;
    reference.setAttribute('aria-expanded', 'false');
    if (restoreFocus) {
      restoringFocus = true;
      reference.focus({ preventScroll: true });
      restoringFocus = false;
    }
  }

  function position() {
    if (!activeReference) return;
    const rect = activeReference.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const margin = 12;
    const gap = 8;
    if (rect.bottom < 0 || rect.top > height) {
      hide(preview.contains(document.activeElement));
      return;
    }
    const below = height - rect.bottom - gap - margin;
    const above = rect.top - gap - margin;
    const placeBelow = below >= Math.min(280, height * .5) || below >= above;
    preview.style.maxHeight = `${Math.max(0, placeBelow ? below : above)}px`;
    const box = preview.getBoundingClientRect();
    preview.style.left = `${Math.max(margin, Math.min(rect.left + rect.width / 2 - box.width / 2, width - box.width - margin))}px`;
    preview.style.top = `${placeBelow ? rect.bottom + gap : rect.top - gap - box.height}px`;
  }

  function show(reference, note) {
    clearTimeout(closeTimer);
    if (activeReference === reference) return;
    hide();
    const copy = note.cloneNode(true);
    copy.querySelectorAll('.reversefootnote, [role="doc-backlink"]').forEach(link => link.remove());
    // Keep rich content without introducing duplicate anchor IDs.
    copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    content.replaceChildren(...copy.childNodes);
    content.scrollTop = 0;
    title.textContent = `脚注 ${reference.textContent.trim()}`;
    source.setAttribute('href', reference.getAttribute('href'));
    activeReference = reference;
    reference.setAttribute('aria-expanded', 'true');
    preview.hidden = false;
    position();
  }

  function scheduleHide() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (preview.contains(document.activeElement) || document.activeElement === activeReference) return;
      hide();
    }, 180);
  }

  references.forEach(reference => {
    let id;
    try {
      id = decodeURIComponent(reference.hash.slice(1));
    } catch {
      return;
    }
    const note = document.getElementById(id);
    if (!note || !article.contains(note) || !note.closest('.footnotes')) return;
    reference.setAttribute('aria-controls', preview.id);
    reference.setAttribute('aria-haspopup', 'dialog');
    reference.setAttribute('aria-expanded', 'false');
    reference.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') show(reference, note);
    });
    reference.addEventListener('pointerleave', scheduleHide);
    reference.addEventListener('pointerdown', event => { pointerType = event.pointerType; });
    reference.addEventListener('focus', () => {
      if (!restoringFocus && reference.matches(':focus-visible')) show(reference, note);
    });
    reference.addEventListener('blur', scheduleHide);
    reference.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        show(reference, note);
        content.focus({ preventScroll: true });
      }
    });
    reference.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (pointerType === 'touch' || pointerType === 'pen' || event.detail === 0) {
        event.preventDefault();
        if (activeReference === reference) hide();
        else show(reference, note);
      } else {
        hide();
      }
      pointerType = '';
    });
  });

  preview.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  preview.querySelector('.footnote-preview__close').addEventListener('click', () => hide(true));
  preview.addEventListener('pointerleave', scheduleHide);
  preview.addEventListener('focusin', () => clearTimeout(closeTimer));
  preview.addEventListener('focusout', scheduleHide);
  source.addEventListener('click', () => hide(true));
  document.addEventListener('pointerdown', event => {
    if (activeReference && !preview.contains(event.target) && !activeReference.contains(event.target)) hide();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeReference) {
      event.preventDefault();
      hide(preview.contains(document.activeElement));
    }
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', event => {
    if (!preview.contains(event.target)) position();
  }, { capture: true, passive: true });
  preview.addEventListener('load', position, true);
});
