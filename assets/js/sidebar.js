const sidebarToggleBtn = document.querySelector('#sidebar__toggle-btn')
const sidebarCollapsibleContainer = document.querySelector('#sidebar__collapsible-container')
const sidebarMainContainer = document.querySelector('#sidebar__main-container')

function isMobile() {
  return window.innerWidth <= 1024 || window.innerHeight <= 650
}

function initializeSidebar() {
  const isCollapsed = sidebarCollapsibleContainer.classList.contains('sidebar__collapsible-container--collapsed')
  if (!isCollapsed) {
    toggleSidebar()
  }
}

initializeSidebar()

window.addEventListener('resize', () => {
  initializeSidebar()
})

function toggleSidebar() {
  const isCollapsed = sidebarCollapsibleContainer.classList.contains('sidebar__collapsible-container--collapsed')

  sidebarCollapsibleContainer.classList.toggle('sidebar__collapsible-container--collapsed', !isCollapsed)
  sidebarToggleBtn.classList.toggle('sidebar__toggle-btn--expanded', isCollapsed)
  sidebarMainContainer.style.gap = isCollapsed ? '1rem' : '.5rem'
}

sidebarToggleBtn.addEventListener('click', toggleSidebar)
