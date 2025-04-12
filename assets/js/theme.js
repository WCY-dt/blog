const themeSwitcher = document.querySelector('#theme-switcher')

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme) // Use data-theme attribute on the html element
    themeSwitcher.textContent = theme === 'light' ? 'dark_mode' : 'light_mode'
    localStorage.setItem('theme', theme)
    if (typeof setCommentTheme === 'function') {
        setCommentTheme(theme)
    }
}

function applySystemTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    setTheme(prefersDarkScheme.matches ? 'dark' : 'light')
}

const currentTheme = localStorage.getItem('theme')
currentTheme ? setTheme(currentTheme) : applySystemTheme()

themeSwitcher.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme)
