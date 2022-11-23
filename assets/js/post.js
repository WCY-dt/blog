var langMap = {
    "language-makefile": "Makefile",
    "language-html": "HTML",
    "language-xml": "XML",
    "language-svg": "SVG",
    "language-css": "CSS",
    "language-clike": "C-like",
    "language-js": "JavaScript",
    "language-Javascript": "JavaScript",
    "language-assembly": "Assembly",
    "language-nasm": "Assembly",
    "language-aspnet": "ASP.NET",
    "language-shell": "Shell",
    "language-basic": "BASIC",
    "language-csharp": "C#",
    "language-dotnet": ".net",
    "language-cpp": "C++",
    "language-django": "Django",
    "language-jinja2": "Django",
    "language-dockerfile": "Docker",
    "language-fsharp": "F#",
    "language-http": "HTTP",
    "language-json": "JSON",
    "language-latex": "LaTeX",
    "language-emacs": "Lisp",
    "language-lisp": "Lisp",
    "language-matlab": "MATLAB",
    "language-nginx": "nginx",
    "language-objectivec": "Objective-C",
    "language-pascal": "Pascal",
    "language-php": "PHP",
    "language-powershell": "PowerShell",
    "language-properties": ".properties",
    "language-jsx": "React JSX",
    "language-tsx": "React TSX",
    "language-sas": "SAS",
    "language-sass": "Sass",
    "language-scss": "Scss",
    "language-sql": "SQL",
    "language-ts": "TypeScript",
    "language-vhdl": "VHDL",
    "language-vim": "Vim",
    "language-vb": "Visual Basic",
    "language-xquery": "XQuery",
    "language-yaml": "YAML",
    "language-c": "C",
    "language-bash": "Bash",
    "language-plaintext": "Plain Text",
    "language-py": "Python",
    "language-python": "Python"
};

// display copy button -> post.html -> pre .highlight
$(function () {
    $.each($(".highlight pre"), function (idx, hl) {
        var lang = $(hl.parentNode.parentNode).attr("class").split(" ")[0];

        var displayLangText = "";
        if (lang in langMap) displayLangText = langMap[lang];
        else displayLangText = lang.split('-')[1];

        var btn = document.createElement("button");
        btn.setAttribute("class", "copy_btn");
        btn.setAttribute("onclick", "copy_code(this)");
        btn.innerHTML = "<i class='fa btn_icon fa-clipboard'><p class='btn_text'>" + displayLangText + "</p></i >";
        // insert before children of hl
        hl.insertBefore(btn, hl.firstChild);
    });
});

// copy code and add line feed automatically
function copy_code(obj) {
    var code = obj.parentNode.querySelector("code").innerText;
    var textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    var icon = obj.querySelector("i");
    var text = icon.querySelector("p").innerHTML;
    icon.setAttribute("class", "fa btn_icon fa-check");
    icon.querySelector("p").innerHTML = "Copied";
    setTimeout(function () {
        icon.setAttribute("class", "fa btn_icon fa-clipboard");
        icon.querySelector("p").innerHTML = text;
    }, 1000);
}

// put <p></p> around <table></table>
$(function () {
    var tables = $("table");
    $.each(tables, function (idx, table) {
        var p = document.createElement("p");
        table.parentNode.insertBefore(p, table);
        p.appendChild(table);
    });
});

// generate table of contents and add it to class toc-content
$(function () {
    // get all headers
    var headers = $("h1, h2, h3, h4, h5, h6");

    // add the id attribute to the header
    $.each(headers, function (idx, header) {
        var id = header.innerText.replace(/ /g, "-");
        header.setAttribute("id", id);
    });

    // find class toc-content
    var toc = $(".toc-content");

    // put headers into toc
    $.each(headers, function (idx, header) {
        var a = document.createElement("a");
        a.setAttribute("href", "#" + header.id);
        a.innerHTML = header.innerText;
        // set class according to header level
        a.setAttribute("class", "toc-" + header.tagName.toLowerCase());
        toc.append(a);
    });
});

// move the mage a little bit up after clicking at .toc-content a
$(function () {
    // get the height of the wihndow
    var windowHeight = $(window).height();
    $(".toc-content a").click(function () {
        var header = $(this).attr("href");
        var top = $(header).offset().top - windowHeight * 0.08;
        $("html, body").animate({ scrollTop: top }, 500);
    });
});
