function change_color_theme() {
    const body = document.body;
    const currentTheme = body.getAttribute('color_theme');

    let newTheme = 'light';
    if (currentTheme === 'dark') {
        newTheme = 'light';
    } else {
        newTheme = 'dark';
    }

    body.setAttribute('color_theme', newTheme);
    // Save the new theme to localStorage
    localStorage.setItem('color_theme', newTheme);

    updateThemeStyles();
}

function updateThemeStyles() {
    const body = document.body;
    let currentTheme = body.getAttribute('color_theme');
    const themeToggle = document.getElementById('theme-toggle');

    // If there's a theme saved in localStorage, use it
    if (localStorage.getItem('color_theme')) {
        currentTheme = localStorage.getItem('color_theme');
        body.setAttribute('color_theme', currentTheme);
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            currentTheme = 'dark';
        }
    }

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
    } else {
        themeToggle.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
    }

    // Get the <head> element
    const head = document.head;

    // Remove the existing theme stylesheet if it exists
    const existingThemeStylesheet = document.getElementById('theme-stylesheet');
    if (existingThemeStylesheet) {
        head.removeChild(existingThemeStylesheet);
    }

    // Create a new <link> element for the theme stylesheet
    const themeStylesheet = document.createElement('link');
    themeStylesheet.id = 'theme-stylesheet';
    themeStylesheet.rel = 'stylesheet';
    themeStylesheet.type = 'text/css';

    // 获取 site.baseurl
    const baseurl = document.querySelector('meta[name="baseurl"]').getAttribute('content');

    // Set the href attribute based on the current theme
    if (currentTheme === 'dark') {
        themeStylesheet.href = baseurl + '/assets/css/syntax_dark.css';        
    } else {
        themeStylesheet.href = baseurl + '/assets/css/syntax_light.css';
    }

    // Add the new theme stylesheet to the <head>
    head.appendChild(themeStylesheet);
}

document.addEventListener('DOMContentLoaded', function () {
    updateThemeStyles();
});