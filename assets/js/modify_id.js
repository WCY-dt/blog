let headerLinks = document.querySelector('#post-content-container').querySelectorAll('h2, h3, h4, h5, h6')
headerLinks.forEach(function (link) {
    let id = link.id
    if (/^\d/.test(id)) {
        preChar = '§'
        link.id = preChar + id
    }
})
