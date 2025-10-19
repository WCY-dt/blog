---
---
const themeSwitcher = document.querySelector('#sidebar__theme-btn');

// Function to set the theme (light or dark)
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme); // Set the theme attribute on the root element
  themeSwitcher.textContent = theme === 'light' ? 'dark_mode' : 'light_mode'; // Update the theme switcher button icon
  localStorage.setItem('blog-theme', theme); // Save the selected theme to localStorage
  if (typeof setCommentTheme === 'function') {
    setCommentTheme(theme); // Update the theme for comments if the function exists
  }
}

// Get the current theme from localStorage or use the default theme from site configuration
const currentTheme = localStorage.getItem('blog-theme');
currentTheme ? setTheme(currentTheme) : setTheme('{{ site.color_theme | default: 'light' }}');

// Add a click event listener to the theme switcher button to toggle the theme
themeSwitcher.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
});
