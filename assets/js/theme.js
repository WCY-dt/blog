---
---
const themeSwitcher = document.querySelector('#theme-toggle');

// Function to set the theme (light or dark)
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme); // Set the theme attribute on the root element
  themeSwitcher.setAttribute('aria-label', theme === 'light' ? '切换深色主题' : '切换浅色主题');
  themeSwitcher.title = themeSwitcher.getAttribute('aria-label');
  try { localStorage.setItem('blog-theme', theme); } catch (e) { /* Storage is optional. */ }
  if (typeof setCommentTheme === 'function') {
    setCommentTheme(theme); // Update the theme for comments if the function exists
  }
}

// Get the current theme from localStorage or use the default theme from site configuration
let currentTheme;
try { currentTheme = localStorage.getItem('blog-theme'); } catch (e) { /* Use site default. */ }
setTheme(['light', 'dark'].includes(currentTheme) ? currentTheme : '{{ site.color_theme | default: 'light' }}');

// Add a click event listener to the theme switcher button to toggle the theme
themeSwitcher.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
});
