// full-text search of the whole blog

// search function
function fulltext_search() {
    // get the query string
    var query = document.getElementById("search").value;
    // if the query is empty, return
    if (query == "") {
        return;
    }
    // get the search results div
    var results = document.getElementById("results");
    // clear the previous results
    results.innerHTML = "";
    // get the search results
    var searchResults = window.index.search(query);
    // if there are no results, return
    if (searchResults.length == 0) {
        results.innerHTML = "No results found";
        return;
    }
    // display the search results
    for (var i = 0; i < searchResults.length; i++) {
        var result = searchResults[i];
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = result.ref;
        a.innerHTML = result.doc.title;
        li.appendChild(a);
        results.appendChild(li);
    }
}

// search on keyup
document.getElementById("search").addEventListener("keyup", search);

// search on click
document.getElementById("search-button").addEventListener("click", search);

// search on enter
document.getElementById("search").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("search-button").click();
    }
});