if (document.fonts) {
  document.fonts.load('1em "Material Symbols Outlined"').then(() => {
    document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
      icon.style.display = 'inline-block'
    })
  })
} else {
  window.onload = function () {
    document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
      icon.style.display = 'inline-block'
    })
  }
}
