let content = document.querySelector('#post-content-container');
let headerLinks = content.querySelectorAll('h2, h3, h4, h5, h6');
headerLinks.forEach(function (link) {
    let id = link.id;
    if (/^\d/.test(id)) {
        preChar = '§';
        link.id = preChar + id;
    }
});