const backToTopButton = document.querySelector('#back-to-top')
function updateBackToTop() {
  backToTopButton.hidden = window.scrollY < 500
}
window.addEventListener('scroll', updateBackToTop, { passive: true })
updateBackToTop()
backToTopButton.addEventListener('click', () => {
  // A control that disappears after scrolling must not strand keyboard focus.
  document.querySelector('.header__title-wrapper')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
})
