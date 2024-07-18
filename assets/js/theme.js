const themeSwitcher = document.querySelector('#theme-switcher');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme); // Use data-theme attribute on the html element
    themeSwitcher.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    localStorage.setItem('theme', theme);
}

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    setTheme(currentTheme);
} else {
    setTheme('light');
}

themeSwitcher.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
});