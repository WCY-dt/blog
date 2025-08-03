---
---
const themeSwitcher = document.querySelector('#sidebar__theme-btn');

function setTheme(theme) { document.documentElement.setAttribute('data-theme',
theme); themeSwitcher.textContent = theme === 'light' ? 'dark_mode' :
'light_mode'; localStorage.setItem('blog-theme', theme); if (typeof
setCommentTheme === 'function') { setCommentTheme(theme); } }

const currentTheme = localStorage.getItem('blog-theme'); currentTheme ?
setTheme(currentTheme) : setTheme('{{ site.color_theme | default: 'light' }}');

themeSwitcher.addEventListener('click', () => { const newTheme =
document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' :
'light'; setTheme(newTheme) });
