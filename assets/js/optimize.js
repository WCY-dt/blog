document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        var images = document.getElementsByTagName('img');
        for (var i = 0; i < images.length; i++) {
            images[i].setAttribute('loading', 'lazy');
        }
    }
}