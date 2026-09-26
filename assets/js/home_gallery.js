// The original links remain the accessible gallery; a small edge buffer makes each row loop.
(() => {
  const gallery = document.querySelector('.home-gallery')
  if (!gallery) return
  const tracks = [...gallery.querySelectorAll('.home-gallery-track')]
  const toggle = gallery.querySelector('.home-gallery-toggle')
  if (!toggle || !tracks.length) return
  if (!('IntersectionObserver' in window)) {
    // Keep a usable native gallery in older browsers without starting an unbounded eager queue.
    gallery.querySelectorAll('img[data-gallery-src]').forEach(img => { img.src = img.dataset.gallerySrc })
    return
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let paused = motion.matches
  let manuallyPaused = false
  let visible = !('IntersectionObserver' in window)
  let frame = 0
  let lastFrame = 0
  let resumeTimer = 0
  let resumeAfter = 0
  let resizeFrame = 0
  let drag = null
  let rebuilding = false
  let nearby = !('IntersectionObserver' in window)
  const imageStates = new WeakMap()
  const speed = 16

  function updateToggle() {
    toggle.setAttribute('aria-pressed', String(!paused))
    toggle.title = paused ? '继续自动滚动' : '暂停自动滚动'
  }

  function makeClone(source) {
    const clone = source.cloneNode(true)
    clone.dataset.galleryClone = ''
    clone.setAttribute('aria-hidden', 'true')
    clone.tabIndex = -1
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'))
    clone.querySelectorAll('img').forEach(img => {
      img.removeAttribute('src')
      img.loading = 'lazy'
      img.draggable = false
    })
    return clone
  }

  const rows = tracks.map((track, index) => {
    const originals = [...track.querySelectorAll('.home-gallery-work')]
    originals.forEach(link => link.querySelectorAll('img').forEach(img => { img.draggable = false }))
    return { track, index, originals, origin: 0, period: 0, step: 112, position: 0, expected: 0,
      enabled: false, hovered: false, focused: false, held: false, suppressClick: false,
      visibleImages: new Set(), retainedImages: new Set(), sourceImages: new Map(),
      imagesObserved: false, observerGeneration: 0, imageObserver: null, viewObserver: null, retentionObserver: null }
  })

  function loadImage(img) {
    if (imageStates.has(img)) return
    const source = img.dataset.gallerySrc
    if (!source) return
    const state = { settled: false, cancel: null }
    imageStates.set(img, state)
    let timeout
    const settle = () => {
      if (state.settled || imageStates.get(img) !== state) return
      state.settled = true
      state.cancel()
      if (img.isConnected) schedule()
    }
    const decode = () => {
      if (typeof img.decode === 'function') img.decode().catch(() => {}).then(settle)
      else settle()
    }
    state.cancel = () => {
      window.clearTimeout(timeout)
      img.removeEventListener('load', decode)
      img.removeEventListener('error', settle)
    }
    img.addEventListener('load', decode)
    img.addEventListener('error', settle)
    // A failed or stalled image must not freeze every other cover indefinitely.
    timeout = window.setTimeout(settle, 15000)
    // IO has already admitted this asset. Its offscreen seam counterpart must decode too.
    img.loading = 'eager'
    img.src = source
    if (img.complete && img.naturalWidth > 0) decode()
  }

  function unloadImage(img) {
    imageStates.get(img)?.cancel()
    imageStates.delete(img)
    img.removeAttribute('src')
    img.loading = 'lazy'
  }

  function stopObservingImages(row) {
    row.observerGeneration += 1
    row.imageObserver?.disconnect()
    row.viewObserver?.disconnect()
    row.retentionObserver?.disconnect()
    row.imageObserver = null
    row.viewObserver = null
    row.retentionObserver = null
    row.visibleImages.clear()
    row.retainedImages.clear()
    row.sourceImages.clear()
    row.imagesObserved = false
  }

  function observeImages(row) {
    stopObservingImages(row)
    const generation = row.observerGeneration
    const images = row.track.querySelectorAll('img[data-gallery-src]')
    if (!nearby) {
      images.forEach(unloadImage)
      return
    }
    images.forEach(img => {
      const source = img.dataset.gallerySrc
      if (!row.sourceImages.has(source)) row.sourceImages.set(source, [])
      row.sourceImages.get(source).push(img)
    })
    const loadSource = img => row.sourceImages.get(img.dataset.gallerySrc)?.forEach(loadImage)
    if (!('IntersectionObserver' in window)) {
      // Older browsers retain their native lazy-loading fallback.
      images.forEach(loadImage)
      row.imagesObserved = true
      return
    }
    row.imageObserver = new IntersectionObserver(entries => {
      if (generation !== row.observerGeneration) return
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        loadSource(entry.target)
      })
    }, { root: row.track, rootMargin: `0px ${Math.ceil(row.step)}px`, threshold: 0 })
    row.viewObserver = new IntersectionObserver(entries => {
      if (generation !== row.observerGeneration) return
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          row.visibleImages.add(entry.target)
          loadSource(entry.target)
        } else row.visibleImages.delete(entry.target)
      })
      row.imagesObserved = true
      schedule()
    }, { root: row.track, threshold: 0 })
    // A wider release boundary avoids thrashing when the user drags back and forth.
    row.retentionObserver = new IntersectionObserver(entries => {
      if (generation !== row.observerGeneration) return
      entries.forEach(entry => {
        if (entry.isIntersecting) row.retainedImages.add(entry.target)
        else row.retainedImages.delete(entry.target)
      })
      row.sourceImages.forEach(group => {
        if (!group.some(img => row.retainedImages.has(img))) group.forEach(unloadImage)
      })
    }, { root: row.track, rootMargin: `0px ${Math.ceil(row.step * 3)}px`, threshold: 0 })
    images.forEach(img => {
      row.imageObserver.observe(img)
      row.viewObserver.observe(img)
      row.retentionObserver.observe(img)
    })
  }

  function write(row, position) {
    row.position = position
    row.track.scrollLeft = position
    // Keep a separate fractional position: some browsers round the DOM scroll offset.
    row.expected = row.track.scrollLeft
  }

  function loopPosition(row, position) {
    if (!row.enabled) return position
    const offset = ((position - row.origin) % row.period + row.period) % row.period
    return row.origin + offset
  }

  function normalize(row) {
    if (!row.enabled) return
    // Do not move an original keyboard-focused link out of its visible location.
    const focusedLink = document.activeElement?.closest('.home-gallery-work')
    if (focusedLink && row.originals.includes(focusedLink)) return
    const next = loopPosition(row, row.position)
    const correction = next - row.position
    if (Math.abs(correction) < 0.01) return
    if (drag?.row === row) drag.startScroll += correction
    write(row, next)
  }

  function rebuild() {
    rebuilding = true
    rows.forEach(row => {
      stopObservingImages(row)
      const progress = row.period ? ((row.position - row.origin) % row.period + row.period) % row.period / row.period : null
      row.track.querySelectorAll('[data-gallery-clone]').forEach(clone => {
        clone.querySelectorAll('img[data-gallery-src]').forEach(unloadImage)
        clone.remove()
      })
      row.enabled = false
      if (row.originals.length < 2 || row.track.clientWidth === 0) return
      const first = row.originals[0]
      const step = row.originals[1].getBoundingClientRect().left - first.getBoundingClientRect().left
      row.step = step
      const period = step * row.originals.length
      if (!(step > 0) || period <= row.track.clientWidth + 1) {
        row.period = 0
        write(row, 0)
        return
      }
      const bufferSize = Math.min(row.originals.length, Math.ceil(row.track.clientWidth / step) + 1)
      const before = document.createDocumentFragment()
      const after = document.createDocumentFragment()
      row.originals.slice(-bufferSize).forEach(link => before.append(makeClone(link)))
      row.originals.slice(0, bufferSize).forEach(link => after.append(makeClone(link)))
      row.track.prepend(before)
      row.track.append(after)
      row.period = period
      row.origin = first.getBoundingClientRect().left - row.track.getBoundingClientRect().left + row.track.scrollLeft - row.track.clientLeft
      row.enabled = true
      write(row, row.origin + (progress === null ? row.index * step / 2 : progress * period))
    })
    const enabled = rows.some(row => row.enabled)
    gallery.classList.toggle('home-gallery--enhanced', enabled)
    toggle.hidden = !enabled
    rebuilding = false
    rows.forEach(observeImages)
    schedule()
  }

  function blocked() {
    return paused || !visible || document.hidden || rebuilding ||
      !rows.some(row => row.enabled) || rows.some(row => row.hovered || row.focused || row.held)
      || rows.some(row => row.enabled && (!row.imagesObserved || [...row.visibleImages].some(img =>
        row.sourceImages.get(img.dataset.gallerySrc)?.some(copy => !imageStates.get(copy)?.settled))))
  }

  function schedule() {
    window.clearTimeout(resumeTimer)
    resumeTimer = 0
    if (blocked() || performance.now() < resumeAfter) {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lastFrame = 0
      if (!blocked()) resumeTimer = window.setTimeout(schedule, Math.max(0, resumeAfter - performance.now()) + 20)
      return
    }
    if (!frame) frame = requestAnimationFrame(animate)
  }

  function animate(now) {
    frame = 0
    if (blocked() || now < resumeAfter) { schedule(); return }
    const elapsed = lastFrame ? Math.min(now - lastFrame, 50) : 0
    lastFrame = now
    rows.forEach(row => {
      if (row.enabled) write(row, loopPosition(row, row.position + elapsed * speed / 1000))
    })
    frame = requestAnimationFrame(animate)
  }

  function afterInteraction() {
    resumeAfter = performance.now() + 1400
    schedule()
  }

  rows.forEach(row => {
    const track = row.track
    track.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      row.hovered = true
      schedule()
    })
    track.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      row.hovered = false
      schedule()
    })
    track.addEventListener('focusin', () => { row.focused = true; schedule() })
    track.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        row.focused = track.contains(document.activeElement)
        if (!row.focused) normalize(row)
        schedule()
      })
    })
    track.addEventListener('scroll', () => {
      if (rebuilding || Math.abs(track.scrollLeft - row.expected) <= 0.6) return
      row.position = track.scrollLeft
      row.expected = track.scrollLeft
      normalize(row)
      afterInteraction()
    }, { passive: true })
    track.addEventListener('wheel', afterInteraction, { passive: true })
    track.addEventListener('dragstart', event => event.preventDefault())
    track.addEventListener('pointerdown', event => {
      if (!row.enabled || !event.isPrimary || event.button !== 0) return
      row.held = true
      schedule()
      if (event.pointerType === 'touch') {
        // Pointer scrolling ends keyboard inspection; retain native horizontal and vertical gestures.
        if (track.contains(document.activeElement)) document.activeElement.blur()
        row.focused = false
        return
      }
      drag = { row, pointerId: event.pointerId, startX: event.clientX, startScroll: track.scrollLeft, moved: false }
    })
    track.addEventListener('pointermove', event => {
      if (!drag || drag.row !== row || drag.pointerId !== event.pointerId) return
      const distance = event.clientX - drag.startX
      if (!drag.moved && Math.abs(distance) < 5) return
      if (!drag.moved) {
        drag.moved = true
        // Mouse-down focuses links. A real drag must not leave that focus blocking the loop.
        if (track.contains(document.activeElement)) document.activeElement.blur()
        row.focused = false
        track.setPointerCapture(event.pointerId)
        gallery.classList.add('home-gallery--dragging')
      }
      if (event.cancelable) event.preventDefault()
      write(row, drag.startScroll - distance)
      normalize(row)
    })
    track.addEventListener('click', event => {
      if (!row.suppressClick) return
      row.suppressClick = false
      event.preventDefault()
      event.stopImmediatePropagation()
    }, true)
    track.addEventListener('lostpointercapture', finishPointer)
  })

  function finishPointer(event) {
    if (!drag && !rows.some(row => row.held)) return
    rows.forEach(row => { row.held = false })
    if (drag && drag.pointerId === event.pointerId) {
      const current = drag
      drag = null
      if (current.moved) {
        current.row.suppressClick = true
        window.setTimeout(() => { current.row.suppressClick = false }, 400)
      }
      if (current.row.track.hasPointerCapture(event.pointerId)) current.row.track.releasePointerCapture(event.pointerId)
    }
    gallery.classList.remove('home-gallery--dragging')
    afterInteraction()
  }
  window.addEventListener('pointerup', finishPointer)
  window.addEventListener('pointercancel', finishPointer)
  window.addEventListener('blur', () => {
    drag = null
    rows.forEach(row => { row.held = false; row.hovered = false })
    gallery.classList.remove('home-gallery--dragging')
    schedule()
  })

  toggle.addEventListener('click', () => {
    paused = !paused
    manuallyPaused = paused
    resumeAfter = 0
    updateToggle()
    schedule()
  })
  motion.addEventListener('change', () => {
    paused = manuallyPaused || motion.matches
    updateToggle()
    schedule()
  })
  document.addEventListener('visibilitychange', schedule)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      schedule()
    }).observe(gallery)
    new IntersectionObserver(entries => {
      nearby = entries.some(entry => entry.isIntersecting)
      rows.forEach(observeImages)
      schedule()
    }, { rootMargin: '400px 0px' }).observe(gallery)
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; rebuild() })
    }).observe(gallery.querySelector('.home-gallery-rows'))
  } else {
    window.addEventListener('resize', () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; rebuild() })
    })
  }
  updateToggle()
  rebuild()
})()
