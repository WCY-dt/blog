const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('results');

let isSearching = false;

searchButton.addEventListener('click', () => {
  if (!isSearching) {
    searchButton.innerHTML = 'close';
    searchInput.style.width = '20rem';
    searchInput.style.paddingLeft = '0.5rem';
    searchInput.style.paddingRight = '0.5rem';
    searchInput.focus();
    isSearching = true;
  } else {
    searchButton.innerHTML = 'manage_search';
    searchInput.style.width = '0';
    searchInput.style.paddingLeft = '0';
    searchInput.style.paddingRight = '0';
    searchInput.value = '';
    searchResults.innerHTML = '';
    isSearching = false;
  }
});

searchInput.addEventListener('input', (event) => {
  const searchText = event.target.value;
  if (searchText.length > 0) {
    searchContent(searchText);
  } else {
    searchResults.innerHTML = '';
  }
});

const searchContent = (searchText) => {
  fetch('/search.json')
    .then(response => response.json())
    .then(data => {
      const regex = new RegExp(searchText, 'gi');
      const posts = data.map(post => {
        let titleMatch = post.title.toLowerCase().includes(searchText.toLowerCase());
        let contentMatch = post.content.toLowerCase().includes(searchText.toLowerCase());
        if (titleMatch) {
          const snippet = post.content.substring(0, 120) + '...';
          titleMatch = post.title.replace(regex, '<em>$&</em>');
          return { ...post, title: titleMatch, content: snippet };
        } else if (contentMatch) {
          const index = post.content.toLowerCase().indexOf(searchText.toLowerCase());
          const start = Math.max(0, index - 60);
          const end = Math.min(post.content.length, index + searchText.length + 60);
          let snippet = '...' + post.content.substring(start, end) + '...';
          snippet = snippet.replace(regex, '<em>$&</em>');
          return { ...post, content: snippet };
        } else {
          return null;
        }
      }).filter(post => post !== null);
      renderSearchResults(posts);
    });
}

const renderSearchResults = (posts) => {
  searchResults.innerHTML = '';
  posts.forEach(post => {
    searchResults.innerHTML += /*html*/ `
      <li>
        <a href="${post.url}">
          <div class="search-title">${post.title}</div>
          <p class="search-content">${post.content}</p>
        </a>
      </li>
    `;
  });
}