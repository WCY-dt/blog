const themeSwitcher = document.querySelector('#theme-switcher');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme); // Use data-theme attribute on the html element
    themeSwitcher.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    localStorage.setItem('theme', theme);
}

const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    setTheme(currentTheme);
    if (typeof setCommentTheme === 'function') {
        setCommentTheme(currentTheme);
    }
} else {
    setTheme('light');
    if (typeof setCommentTheme === 'function') {
        setCommentTheme('light');
    }
}

themeSwitcher.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        setTheme('dark');
        if (typeof setCommentTheme === 'function') {
            setCommentTheme('dark');
        }
    } else {
        setTheme('light');
        if (typeof setCommentTheme === 'function') {
            setCommentTheme('light');
        }
    }
});