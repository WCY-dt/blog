// Select the mobile menu button and menu container
const menuContainerMobileButton = document.querySelector('#sidebar__menu-btn');
const menuContainerMobileMenu = document.querySelector('#sidebar__menu-content');

// Initially hide the mobile menu
menuContainerMobileMenu.style.display = 'none';

// Add a click event listener to toggle the menu visibility
menuContainerMobileButton.addEventListener('click', () => {
  const isHidden = menuContainerMobileMenu.style.display === 'none'; // Check if the menu is hidden
  menuContainerMobileMenu.style.display = isHidden ? 'flex' : 'none'; // Toggle the display style
  menuContainerMobileButton.innerHTML = isHidden ? 'close' : 'featured_play_list'; // Update the button icon
  menuContainerMobileButton.classList.toggle('sidebar__menu-btn--active', isHidden); // Toggle the active class
});
