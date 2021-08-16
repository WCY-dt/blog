$(document).ready(function () {
  $('figure.highlight').each(function (x, r) {
    if ($(r).find('table').length < 1) {
      $(r).find('pre').css('padding', '5px 0px 5px 0px');
    }
  });
});

$(function () {
  $('.row h1,h2,h3,h4,h5,h6').each(function () {
    $(this).attr("id", $(this).text());
  });
});

let hone = document.querySelectorAll(".row h1,h2,h3,h4,h5,h6");
for (let h of hone) {
  let cont = h.innerHTML;
  h.innerHTML = "<a href='#" + cont + "'>" + cont + "</a>";
  let ahref = h.querySelector("a");
  ahref.style.cssText = "text-decoration:none;color:black;";
}

$(function () {
  $('pre code').each(function () {
    var lines = $(this).text().split('\n').length - 1;
    var $numbering = $('<ul/>').addClass('pre-numbering');
    $(this)
      .addClass('has-numbering')
      .parent()
      .append($numbering);
    for (i = 1; i <= lines; i++) {
      $numbering.append($('<li/>').text(i));
    }
  });
});

$(function () {
  $(".highlighter-rouge").each(function () {
    var item = $(this);
    var lang = item.attr("class").split(' ')[0];  /*  获取高亮的语言，得到js/html/cpp等全小写的语言名，下面进行一个转换  */
    var langMap = {
      "language-html": "HTML",
      "language-xml": "XML",
      "language-svg": "SVG",
      "language-css": "CSS",
      "language-clike": "C-like",
      "language-js": "JavaScript",
      "language-Javascript": "JavaScript",
      "language-assembly": "Assembly",
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
      "language-nasm": "NASM",
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
      "language-wiki": "Wiki markup",
      "language-xquery": "XQuery",
      "language-yaml": "YAML",
      "language-c": "C",
      "language-bash": "Bash",
      "language-plaintext": "Plain Text",
      "language-py": "Python",
      "language-python": "Python"
    };

    var displayLangText = "";
    if (lang in langMap) displayLangText = langMap[lang];
    else displayLangText = lang.split('-')[1];
    item.find('pre')
      .prepend(
        '<div align="right" top="0px" right="0px" position="absolute" class="copybutton"><a href="javascript:(void(0));"><i class="material-icons">file_copy</i><p>' +
        displayLangText +
        '</p></a></div>');
  });
});

