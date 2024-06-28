let content = document.querySelector('.content');
let headerLinks = content.querySelectorAll('h2, h3, h4, h5, h6');
headerLinks.forEach(function (link) {
    let id = link.id;
    console.log(id);
    if (/^\d/.test(id)) {
        preChar = '§';
        link.id = preChar + id;
    }
});