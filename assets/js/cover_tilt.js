(() => {
  const stage = document.querySelector('[data-cover-tilt]')
  const surface = stage?.querySelector('.feature-cover-surface')
  if (!surface) return

  const allowed = matchMedia('(hover:hover) and (pointer:fine) and (min-width:601px) and (prefers-reduced-motion:no-preference)')
  const target = { x: 0, y: 0, lift: 0 }
  const current = { ...target }
  let frame = 0
  let previousTime = 0
  let visible = true

  function clear() {
    cancelAnimationFrame(frame)
    frame = 0
    previousTime = 0
    Object.assign(target, { x: 0, y: 0, lift: 0 })
    Object.assign(current, target)
    surface.style.removeProperty('transform')
  }

  function render(time) {
    frame = 0
    // Time-based easing keeps the same response on 60 Hz and high-refresh screens.
    const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
    const blend = 1 - Math.exp(-elapsed / 95)
    previousTime = time
    let settled = true
    for (const key of ['x', 'y', 'lift']) {
      current[key] += (target[key] - current[key]) * blend
      if (Math.abs(target[key] - current[key]) > .001) settled = false
      else current[key] = target[key]
    }
    const { x, y, lift } = current
    // Overscan stays inside the fixed square: tilted edges never reveal a gap.
    // At rest the transform is removed, restoring the complete original cover.
    surface.style.transform = `scale(${1 + lift * .08}) translate3d(${x * 2}px,${y * 2}px,0) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`
    if (!settled) frame = requestAnimationFrame(render)
    else {
      previousTime = 0
      if (!target.lift) clear()
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render)
  }

  function follow(event) {
    if (!allowed.matches || !visible || event.pointerType !== 'mouse' || document.hidden) return
    // Use the whole viewport, so moving over type or whitespace feels continuous.
    target.x = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1))
    target.y = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1))
    target.lift = 1
    schedule()
  }

  function release() {
    if (!current.lift && !target.lift) return
    Object.assign(target, { x: 0, y: 0, lift: 0 })
    schedule()
  }

  function sync() {
    clear()
    stage.classList.toggle('is-tilt-ready', allowed.matches)
  }

  window.addEventListener('pointermove', follow, { passive: true })
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) release() }, { passive: true })
  window.addEventListener('pointercancel', release, { passive: true })
  window.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') clear() }, { passive: true })
  window.addEventListener('scroll', release, { passive: true })
  window.addEventListener('resize', clear, { passive: true })
  window.addEventListener('blur', clear)
  window.addEventListener('pagehide', clear)
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear() })
  allowed.addEventListener('change', sync)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) clear()
    }).observe(stage)
  }
  sync()
})()
