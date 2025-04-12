const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const searchResults = document.getElementById('results')

let isSearching = false

searchButton.addEventListener('click', () => {
  isSearching = !isSearching
  searchButton.innerHTML = isSearching ? 'close' : 'manage_search'
  searchInput.style.width = isSearching ? '20rem' : '0'
  searchInput.style.padding = isSearching ? '0.5rem' : '0'
  if (isSearching) {
    searchInput.focus()
  } else {
    searchInput.value = ''
    searchResults.innerHTML = ''
  }
})

searchInput.addEventListener('input', (event) => {
  const searchText = event.target.value
  searchText.length > 0 ? searchContent(searchText) : (searchResults.innerHTML = '')
})

const searchContent = (searchText) => {
  fetch('/search.json')
    .then(response => response.json())
    .then(data => {
      const regex = new RegExp(searchText, 'gi')
      const posts = data
        .map(post => {
          const titleMatch = post.title.match(regex)
          const contentMatch = post.content.match(regex)
          if (titleMatch || contentMatch) {
            const snippet = contentMatch
              ? `...${post.content.substring(
                  Math.max(0, post.content.toLowerCase().indexOf(searchText.toLowerCase()) - 60),
                  Math.min(post.content.length, post.content.toLowerCase().indexOf(searchText.toLowerCase()) + searchText.length + 60)
                )}...`.replace(regex, '<em>$&</em>')
              : post.content.substring(0, 120) + '...'
            return {
              ...post,
              title: titleMatch ? post.title.replace(regex, '<em>$&</em>') : post.title,
              content: snippet
            }
          }
          return null
        })
        .filter(Boolean)
      renderSearchResults(posts)
    })
}

const renderSearchResults = (posts) => {
  searchResults.innerHTML = posts
    .map(
      post => /*html*/ `
      <li>
        <a href="${post.url}">
          <div class="search-title">${post.title}</div>
          <p class="search-content">${post.content}</p>
        </a>
      </li>
    `
    )
    .join('')
}
