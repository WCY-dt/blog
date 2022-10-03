// Zoom the image upon click and show the image in the center of the screen
$("img").on("click", function () {
    var src = $(this).attr("src");
    var modal = `
        <div class="modal" id="modal">
        <img src="${src}" class="modal__image" />
        </div>
    `;
    $("body").append(modal);
    $("#modal").fadeIn();

    $("#modal").on("click", function () {
        $("#modal").fadeOut(function () {
            $(this).remove();
        });
    });

    // zoom in and out the image upon mouse wheel
    $("#modal").on("wheel", function (e) {
        e.preventDefault();
        var delta = e.originalEvent.deltaY;
        var img = $(this).find("img");
        var width = img.width();
        var height = img.height();
        var ratio = width / height;
        var newWidth = width - delta * ratio * 0.2;
        var newHeight = height - delta * 0.2;
        console.log(newWidth, newHeight);
        console.log($(document).width(), $(document).height());
        // check if the image is too small or too large
        if (newWidth <= 100 || newHeight <= 100 || newWidth > $(document).width() || newHeight > $(document).height()) return;
        img.width(newWidth);
        img.height(newHeight);
    });
});