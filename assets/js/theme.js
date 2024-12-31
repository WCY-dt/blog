const themeSwitcher = document.querySelector('#theme-switcher')

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme) // Use data-theme attribute on the html element
    themeSwitcher.textContent = theme === 'light' ? 'dark_mode' : 'light_mode'
    localStorage.setItem('theme', theme)
}

function applySystemTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
    const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light'
    setTheme(systemTheme)
    if (typeof setCommentTheme === 'function') {
        setCommentTheme(systemTheme)
    }
}

const currentTheme = localStorage.getItem('theme')
if (currentTheme) {
    setTheme(currentTheme)
    if (typeof setCommentTheme === 'function') {
        setCommentTheme(currentTheme)
    }
} else {
    applySystemTheme()
}

themeSwitcher.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        setTheme('dark')
        if (typeof setCommentTheme === 'function') {
            setCommentTheme('dark')
        }
    } else {
        setTheme('light')
        if (typeof setCommentTheme === 'function') {
            setCommentTheme('light')
        }
    }
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme)
