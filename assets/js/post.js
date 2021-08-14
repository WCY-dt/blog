$(document).ready(function(){
  $('figure.highlight').each(function(x, r){
    if ($(r).find('table').length < 1){
      $(r).find('pre').css('padding', '5px 0px 5px 0px');
    }
  });
});

let hone = document.querySelectorAll(".row h1,h2,h3,h4,h5,h6");
for (let h of hone) {
  let cont=h.innerHTML;
  h.innerHTML="<a href='#"+cont+"'>"+cont+"</a>";
  let ahref=h.querySelector("a");
  ahref.style.cssText="text-decoration:none;color:black;";
}

$(function(){
  $('pre code').each(function(){
    var lines = $(this).text().split('\n').length - 1;
    var $numbering = $('<ul/>').addClass('pre-numbering');
    $(this)
      .addClass('has-numbering')
      .parent()
      .append($numbering);
    for(i=1;i<=lines;i++){
      $numbering.append($('<li/>').text(i));
    }
  });
});
