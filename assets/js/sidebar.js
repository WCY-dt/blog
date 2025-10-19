// Get references to the sidebar toggle button, collapsible container, and main container
const sidebarToggleBtn = document.querySelector('#sidebar__toggle-btn')
const sidebarCollapsibleContainer = document.querySelector('#sidebar__collapsible-container')
const sidebarMainContainer = document.querySelector('#sidebar__main-container')

// Check if the current viewport size corresponds to a mobile device
function isMobile() {
  return window.innerWidth <= 1024 || window.innerHeight <= 650
}

// Initialize the sidebar by collapsing it if it is not already collapsed
function initializeSidebar() {
  const isCollapsed = sidebarCollapsibleContainer.classList.contains('sidebar__collapsible-container--collapsed')
  if (!isCollapsed) {
    toggleSidebar()
  }
}

// Call the initialization function on page load
initializeSidebar()

// Reinitialize the sidebar on window resize
window.addEventListener('resize', () => {
  initializeSidebar()
})

// Toggle the sidebar's collapsed state and adjust styles accordingly
function toggleSidebar() {
  const isCollapsed = sidebarCollapsibleContainer.classList.contains('sidebar__collapsible-container--collapsed')

  sidebarCollapsibleContainer.classList.toggle('sidebar__collapsible-container--collapsed', !isCollapsed)
  sidebarToggleBtn.classList.toggle('sidebar__toggle-btn--expanded', isCollapsed)
  sidebarMainContainer.style.gap = isCollapsed ? '1rem' : '.5rem'
}

// Add a click event listener to the toggle button to trigger the sidebar toggle
sidebarToggleBtn.addEventListener('click', toggleSidebar)
