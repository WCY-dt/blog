document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        // 获取所有的img标签
        var images = document.getElementsByTagName('img');

        // 遍历所有的img标签
        for (var i = 0; i < images.length; i++) {
            // 为每个img标签添加loading="lazy"
            images[i].setAttribute('loading', 'lazy');
        }
    }
}