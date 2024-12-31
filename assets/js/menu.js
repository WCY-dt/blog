const menuContainerMobile = document.querySelector('#menu-container-mobile')
const menuContainerMobileButton = document.querySelector('#menu-container-mobile-button')
const menuContainerMobileMenu = document.querySelector('#menu-container-mobile-menu')

menuContainerMobileMenu.style.display = 'none'

menuContainerMobile.addEventListener('click', () => {
    if (menuContainerMobileMenu.style.display === 'none') {
        menuContainerMobileMenu.style.display = 'flex'
        menuContainerMobileButton.innerHTML = 'close'
    } else {
        menuContainerMobileMenu.style.display = 'none'
        menuContainerMobileButton.innerHTML = 'featured_play_list'
    }
})
