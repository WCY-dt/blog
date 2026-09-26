(() => {
  const address = document.getElementById('rss-address')
  const button = document.getElementById('rss-copy')
  const status = document.getElementById('rss-copy-status')
  if (!address || !button || !status) return

  button.hidden = false
  address.addEventListener('click', () => address.select())

  button.addEventListener('click', async () => {
    button.disabled = true
    let copied = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address.value)
        copied = true
      }
    } catch (_) {
      // The selectable field remains usable when clipboard permission is unavailable.
    }
    if (!copied) {
      address.focus()
      address.select()
      try { copied = document.execCommand('copy') } catch (_) { copied = false }
    }
    status.dataset.state = copied ? 'success' : 'manual'
    status.textContent = copied ? '订阅地址已复制。' : '地址已选中，请手动复制。'
    button.disabled = false
    if (copied) button.focus()
  })
})()
