// One search surface for pointer, touch and keyboard users.
const searchDialog = document.getElementById('search-dialog')
const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-open')
const searchResults = document.getElementById('search-results')
const searchStatus = document.getElementById('search-status')
const searchShortcut = searchButton.querySelector('kbd')
if (searchShortcut) searchShortcut.textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
let searchData
let searchRevision = 0
let searchReturnFocus = searchButton
let searchPreviousOverflow = ''

function openSearch(event) {
  if (!searchDialog.open) {
    searchReturnFocus = event?.currentTarget instanceof HTMLElement ? event.currentTarget : document.activeElement
    searchPreviousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    searchDialog.showModal()
  }
  searchInput.focus()
}
searchButton.addEventListener('click', openSearch)
document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch))
searchDialog.querySelector('.search-close').addEventListener('click', () => searchDialog.close())
searchDialog.addEventListener('click', event => {
  const rect = searchDialog.getBoundingClientRect()
  if (event.target === searchDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) searchDialog.close()
})
searchDialog.addEventListener('close', () => {
  searchRevision++
  searchInput.value = ''
  searchResults.replaceChildren()
  searchStatus.textContent = '输入关键词，搜索文章标题、标签与正文。'
  document.body.style.overflow = searchPreviousOverflow
  const target = searchReturnFocus?.isConnected ? searchReturnFocus : searchButton
  target?.focus({ preventScroll: true })
})
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    openSearch()
  }
})
searchDialog.addEventListener('keydown', event => {
  if (event.isComposing || event.keyCode === 229) return
  const links = Array.from(searchResults.querySelectorAll('a'))
  if (!links.length) return
  const index = links.indexOf(document.activeElement)
  if (document.activeElement !== searchInput && index < 0) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    links[Math.min(index + 1, links.length - 1)].focus()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (index <= 0) searchInput.focus()
    else links[index - 1].focus()
  } else if (event.key === 'Enter' && document.activeElement === searchInput) {
    event.preventDefault()
    links[0].click()
  }
})
function highlightedText(element, value, query) {
  const lower = value.toLocaleLowerCase()
  let start = 0
  let match = lower.indexOf(query)
  while (match !== -1) {
    element.append(document.createTextNode(value.slice(start, match)))
    const mark = document.createElement('mark')
    mark.className = 'search-highlight'
    mark.textContent = value.slice(match, match + query.length)
    element.append(mark)
    start = match + query.length
    match = lower.indexOf(query, start)
  }
  element.append(document.createTextNode(value.slice(start)))
}
async function searchArticles(event) {
  if (event?.isComposing) return
  const revision = ++searchRevision
  const query = searchInput.value.trim().toLocaleLowerCase()
  searchResults.replaceChildren()
  searchStatus.textContent = query ? '正在查找…' : '输入关键词，搜索文章标题、标签与正文。'
  if (!query) return
  try {
    const base = document.querySelector('meta[name="baseurl"]')?.content || ''
    searchData ||= fetch(base + '/search.json').then(response => {
      if (!response.ok) throw new Error('Search unavailable')
      return response.json()
    }).catch(error => { searchData = undefined; throw error })
    const data = await searchData
    if (revision !== searchRevision || !searchDialog.open) return
    const matches = data.filter(post => [post.title, post.summary, post.content, post.tags, post.category].some(value => String(value || '').toLocaleLowerCase().includes(query)))
    matches.sort((a, b) => Number(b.title.toLocaleLowerCase().includes(query)) - Number(a.title.toLocaleLowerCase().includes(query)))
    searchStatus.textContent = matches.length ? '找到 ' + matches.length + ' 篇文章' + (matches.length > 50 ? '，显示前 50 篇。' : '。') : '没有找到相关文章，试试其他关键词。'
    const fragment = document.createDocumentFragment()
    matches.slice(0, 50).forEach(post => {
      const item = document.createElement('li')
      item.className = 'search-result'
      const link = document.createElement('a')
      link.href = post.url
      const title = document.createElement('div')
      title.className = 'search-result-title'
      highlightedText(title, post.title, query)
      const content = document.createElement('p')
      // Prefer the author's description for topical matches; retain context for
      // words found only in the article body.
      const summary = (post.summary || '').trim()
      const topicalMatch = [post.title, summary, post.tags, post.category].some(value => String(value || '').toLocaleLowerCase().includes(query))
      const text = summary && topicalMatch ? summary : (post.content || summary)
      const match = text.toLocaleLowerCase().indexOf(query)
      const start = summary && topicalMatch ? 0 : Math.max(0, match - 45)
      const snippet = (start ? '…' : '') + text.slice(start, start + 130) + (text.length > start + 130 ? '…' : '')
      highlightedText(content, snippet, query)
      link.append(title, content)
      item.append(link)
      fragment.append(item)
    })
    searchResults.replaceChildren(fragment)
  } catch (error) {
    if (revision === searchRevision && searchDialog.open) {
      searchStatus.textContent = '暂时无法加载文章索引。'
      const retry = document.createElement('button')
      retry.type = 'button'
      retry.className = 'search-retry'
      retry.textContent = '重新搜索'
      retry.addEventListener('click', () => {
        searchInput.focus({ preventScroll: true })
        searchArticles()
      })
      searchStatus.append(retry)
    }
  }
}
searchInput.addEventListener('input', searchArticles)
searchInput.addEventListener('compositionstart', () => { searchRevision++ })
searchInput.addEventListener('compositionend', searchArticles)
