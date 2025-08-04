const menuContainerMobileButton = document.querySelector('#sidebar__menu-btn')
const menuContainerMobileMenu = document.querySelector('#sidebar__menu-content')

menuContainerMobileMenu.style.display = 'none'

menuContainerMobileButton.addEventListener('click', () => {
  const isHidden = menuContainerMobileMenu.style.display === 'none'
  menuContainerMobileMenu.style.display = isHidden ? 'flex' : 'none'
  menuContainerMobileButton.innerHTML = isHidden ? 'close' : 'featured_play_list'
})
