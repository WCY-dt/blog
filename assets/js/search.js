// Get references to the search input, button, and results container
const searchInput = document.getElementById('sidebar__search-input')
const searchButton = document.getElementById('sidebar__search-btn')
const searchResults = document.getElementById('sidebar__search-list')

// State variable to track whether the search is active
let isSearching = false

// Toggle search bar visibility and functionality when the search button is clicked
searchButton.addEventListener('click', () => {
  isSearching = !isSearching
  searchButton.innerHTML = isSearching ? 'close' : 'manage_search'
  searchInput.style.width = isSearching ? '20rem' : '0'
  searchInput.style.padding = isSearching ? '0.5rem' : '0'
  if (isSearching) {
    searchButton.classList.add('sidebar__search-btn--active')
    searchInput.focus()
  } else {
    searchButton.classList.remove('sidebar__search-btn--active')
    searchInput.value = ''
    searchResults.innerHTML = ''
  }
})

// Handle input events in the search bar
searchInput.addEventListener('input', (event) => {
  const searchText = event.target.value
  searchText.length > 0 ? searchContent(searchText) : (searchResults.innerHTML = '')
})

// Fetch and filter search results based on the input text
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
              )}...`.replace(regex, '<em class="sidebar__search-link-text--em">$&</em>')
              : post.content.substring(0, 120) + '...'
            return {
              ...post,
              title: titleMatch ? post.title.replace(regex, '<em class="sidebar__search-link-text--em">$&</em>') : post.title,
              content: snippet
            }
          }
          return null
        })
        .filter(Boolean)
      renderSearchResults(posts)
    })
}

// Render the filtered search results in the results container
const renderSearchResults = (posts) => {
  searchResults.innerHTML = posts
    .map(
      post => /*html*/ `
      <li class="sidebar__search-item">
        <a href="${post.url}" class="sidebar__search-link">
          <div class="sidebar__search-link-title">${post.title}</div>
          <p class="sidebar__search-link-text">${post.content}</p>
        </a>
      </li>
    `
    )
    .join('')
}
