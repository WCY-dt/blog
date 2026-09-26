(() => {
  const post = document.querySelector('#post__content');
  if (!post) return;

  function openLightbox(content, trigger) {
    const overlay = document.createElement('dialog');
    overlay.className = 'lightbox-wrapper';
    overlay.setAttribute('aria-label', trigger.getAttribute('aria-label') || '查看大图');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'lightbox-close';
    close.setAttribute('aria-label', '关闭大图');
    close.textContent = '×';
    const hint = document.createElement('p');
    hint.className = 'lightbox-hint';
    hint.textContent = '滚轮或双指缩放 · 拖动查看 · Esc 关闭';
    const toolbar = document.createElement('div');
    toolbar.className = 'lightbox-tools';
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', '图片缩放');
    const control = (label, text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lightbox-tool';
      button.textContent = text;
      button.setAttribute('aria-label', label);
      return button;
    };
    const minus = control('缩小图片', '−');
    const plus = control('放大图片', '+');
    const reset = control('恢复适合窗口大小', '复位');
    const scale = document.createElement('output');
    scale.className = 'lightbox-zoom-label';
    scale.setAttribute('aria-label', '相对初始画面的缩放比例');
    toolbar.append(minus, scale, plus, reset);
    overlay.append(content, close, hint, toolbar);
    document.body.append(overlay);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const events = new AbortController();
    const options = { signal: events.signal };
    const cleanup = () => {
      events.abort();
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      trigger.focus({ preventScroll: true });
    };
    overlay.addEventListener('close', cleanup, { once: true });
    close.addEventListener('click', () => overlay.close(), options);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) overlay.close();
    }, options);
    enableZoom(overlay, content, events.signal, { minus, plus, reset, scale });
    overlay.showModal();
    close.focus();
  }

  function enableZoom(overlay, target, signal, controls) {
    let zoom = 1;
    let x = 0;
    let y = 0;
    let pinchDistance = 0;
    let previousX = 0;
    let previousY = 0;
    const pointers = new Map();
    const options = { signal };
    const clamp = value => Math.min(4, Math.max(.1, value));
    const update = () => {
      target.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
      controls.scale.textContent = `${Math.round(zoom * 100)}%`;
      controls.minus.disabled = zoom <= .1;
      controls.plus.disabled = zoom >= 4;
    };
    const resize = factor => { zoom = clamp(zoom * factor); update(); };
    const reset = () => { zoom = 1; x = 0; y = 0; update(); };
    controls.minus.addEventListener('click', () => resize(1 / 1.25), options);
    controls.plus.addEventListener('click', () => resize(1.25), options);
    controls.reset.addEventListener('click', reset, options);
    overlay.addEventListener('keydown', event => {
      if (['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        if (event.key === '+' || event.key === '=') resize(1.25);
        else if (event.key === '-') resize(1 / 1.25);
        else if (event.key === '0') reset();
        else {
          x += event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40 : 0;
          y += event.key === 'ArrowUp' ? -40 : event.key === 'ArrowDown' ? 40 : 0;
          update();
        }
      }
    }, options);
    update();
    target.style.cursor = 'grab';
    target.style.touchAction = 'none';
    overlay.addEventListener('wheel', event => {
      if (event.target.closest('button')) return;
      event.preventDefault();
      const rect = target.getBoundingClientRect();
      const nextZoom = clamp(zoom - event.deltaY * .001);
      x -= (event.clientX - rect.left - rect.width / 2) / zoom * (nextZoom - zoom);
      y -= (event.clientY - rect.top - rect.height / 2) / zoom * (nextZoom - zoom);
      zoom = nextZoom;
      update();
    }, { signal, passive: false });
    target.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      target.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      previousX = event.clientX;
      previousY = event.clientY;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
      }
      target.style.cursor = 'grabbing';
    }, options);
    target.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDistance) zoom = clamp(zoom * distance / pinchDistance);
        pinchDistance = distance;
      } else {
        x += event.clientX - previousX;
        y += event.clientY - previousY;
      }
      previousX = event.clientX;
      previousY = event.clientY;
      update();
    }, options);
    const release = event => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      const remaining = [...pointers.values()][0];
      if (remaining) {
        previousX = remaining.x;
        previousY = remaining.y;
      }
      target.style.cursor = pointers.size ? 'grabbing' : 'grab';
    };
    target.addEventListener('pointerup', release, options);
    target.addEventListener('pointercancel', release, options);
  }

  function bind(trigger, label, createContent) {
    trigger.tabIndex = 0;
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', label);
    trigger.setAttribute('aria-haspopup', 'dialog');
    const open = event => {
      const content = createContent();
      if (!content) return;
      content.classList.add('lightbox__img');
      openLightbox(content, event?.currentTarget || trigger);
    };
    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(event);
      }
    });
  }

  post.querySelectorAll('img').forEach(image => {
    if (image.closest('a, button, .github-issue__header, .cite__header')) return;
    bind(image, `查看大图${image.alt ? '：' + image.alt : ''}`, () => {
      const enlarged = document.createElement('img');
      enlarged.src = image.currentSrc || image.src;
      enlarged.alt = image.alt;
      enlarged.draggable = false;
      return enlarged;
    });
  });
  post.querySelectorAll('.language-mermaid').forEach(mermaid => {
    bind(mermaid, '放大查看图表', () => {
      const source = mermaid.querySelector('svg');
      if (!source) return null;
      const enlarged = document.createElement('div');
      enlarged.className = 'lightbox__mermaid';
      // Fit the complete diagram before zooming; clipping the container would
      // otherwise permanently hide the bottom of tall sequence diagrams.
      const viewBox = source.viewBox.baseVal;
      if (viewBox.width > 0 && viewBox.height > 0) {
        enlarged.style.width = `min(100%, 1000px, calc((100dvh - 192px) * ${viewBox.width / viewBox.height}))`;
      }
      const svg = source.cloneNode(true);
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.maxWidth = '100%';
      enlarged.append(svg);
      return enlarged;
    });
  });
})();
