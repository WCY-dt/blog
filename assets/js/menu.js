const menuContainerMobile = document.querySelector('#menu-container-mobile')
const menuContainerMobileButton = document.querySelector('#menu-container-mobile-button')
const menuContainerMobileMenu = document.querySelector('#menu-container-mobile-menu')

menuContainerMobileMenu.style.display = 'none'

menuContainerMobile.addEventListener('click', () => {
    const isHidden = menuContainerMobileMenu.style.display === 'none'
    menuContainerMobileMenu.style.display = isHidden ? 'flex' : 'none'
    menuContainerMobileButton.innerHTML = isHidden ? 'close' : 'featured_play_list'
})
