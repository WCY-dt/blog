// move on mouse scroll
$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    $(".index-title").css({
        transform: 'translate(0px, -' + scroll * 0.2 + '%)'
    });
    $(".index-pic").css({
        transform: 'translate(' + scroll * 0.2 + '%, 0)'
    });
});

var text = ["Welcome to my blog!", "Scroll down, please!", "233333333333333333!"];
i = 0;
function notion() {
    //stop all the previous settimeout
    clearTimeout(notion);

    $(".index-pic .notion1").text(text[i]);
    i = (i + 1) % text.length;
    $(".index-pic .notion1").css({
        display: 'block'
    });
    $(".index-pic .notion2").css({
        display: 'block'
    });
    setTimeout(function () {
        $(".index-pic .notion1").css({
            display: 'none'
        });
        $(".index-pic .notion2").css({
            display: 'none'
        });
    }, 5000);
}

// opacity of the blogmenu change with the scroll of the page
$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    var height = $(window).height();
    var opacity = scroll / (height * 0.8);
    $(".menu").css({
        opacity: opacity
    });
    // remove class blogmenu-now from the second blogmenu-item and add it to the forth one when scroll half of the page
    if (scroll > height * 0.8 * 0.8) {
        $("#menu-home").removeClass("selected");
        $("#menu-archives").addClass("selected");
    } else {
        $("#menu-archives").removeClass("selected");
        $("#menu-home").addClass("selected");
    }
});

categorylist = ["Security", "Mathematics", "Signal", "Notes", "Languages", "Miscellaneous"];
tmpcategory = 0;

function select(obj) {
    $(".category .list .item").css({
        "background-color": "none",
        "background-image": "var(--blog-gradient-lightyellow-white)"
    });

    var cat = obj.children[2].innerHTML;
    $(".archive .content .pagination .page div").text(cat);
    // find the index of cat in categorylist
    tmpcategory = categorylist.indexOf(cat);
    previoscategory = (tmpcategory + categorylist.length - 1) % categorylist.length;
    nextcategory = (tmpcategory + 1) % categorylist.length;

    // change the onclick of the previos and next button
    $(".archive .content .pagination .previous").attr("onclick", "select(document.getElementsByClassName('category')[0].children[0].children[" + previoscategory + "])");
    $(".archive .content .pagination .next").attr("onclick", "select(document.getElementsByClassName('category')[0].children[0].children[" + nextcategory + "])");

    var paginationlist = $(".generate  ." + cat).html();
    $(".archive .content .text div").html(paginationlist);

    $(obj).css({
        "background-color": "var(--blog-yellow)",
        "background-image": "none"
    });

    setTimeout(function () {
        $(".recent").css({
            transition: 'all 0.3s',
            width: "40%"
        });
        $(".category .list .item .text").css({
            display: 'none'
        });
        $(".category .list").css({
            transition: 'all 0.3s',
            width: '3.2em'
        });
    }, 0);

    setTimeout(function () {
        $(".recent").css({
            display: 'none'
        });
        $(".archive").css({
            transition: 'all 0.3s',
            display: 'flex',
        });
    }, 300);

    setTimeout(function () {
        $(".archive").css({
            transition: 'all 0.3s',
            width: "85%"
        });
    }, 350);
}

// undo all the changes made by select() on click of the '#menu-archive-p'
$("#menu-archives-p").click(function() {
    $(".archive").css({
        transition: 'all 0.3s',
        width: "0%"
    });
    $(".category .list").css({
        transition: 'all 0.3s',
        width: '100%'
    });
    $(".recent").css({
        transition: 'all 0.3s',
        display: 'flex',
        width: "0%"
    });
    $(".category .list .item .text").css({
        display: 'block'
    });
    setTimeout(function () {
        $(".archive").css({
            display: 'none'
        });
    }, 300);
});
