let postImages = document.querySelector('#post-wrapper').querySelectorAll('img')
let postMermaidCodes = document.querySelectorAll('.language-mermaid')

const lightboxZoomSpeed = 0.001
const lightboxZoomMax = 4
const lightboxZoomMin = 0.1

function createOverlay(content) {
  const overlay = document.createElement('div')
  overlay.classList.add('lightbox-wrapper')
  overlay.appendChild(content)
  document.body.appendChild(overlay)

  overlay.addEventListener('click', () => overlay.remove())
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove()
  })

  return overlay
}

function enableZoom(overlay, target) {
  let zoom = 1
  let lastDistance = 0
  let translateX = 0
  let translateY = 0
  let isDragging = false
  let startX = 0
  let startY = 0

  function updateTransform() {
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`
  }

  // 鼠标滚轮缩放（以鼠标位置为中心）
  overlay.addEventListener('wheel', (e) => {
    e.preventDefault()

    // 获取鼠标相对于视口的位置
    const mouseX = e.clientX
    const mouseY = e.clientY

    // 计算鼠标相对于当前图片的位置（考虑当前的平移和缩放）
    const rect = target.getBoundingClientRect()
    const offsetX = (mouseX - rect.left - rect.width / 2) / zoom
    const offsetY = (mouseY - rect.top - rect.height / 2) / zoom

    // 计算新的缩放值
    const oldZoom = zoom
    zoom += e.deltaY * -lightboxZoomSpeed
    zoom = Math.min(Math.max(lightboxZoomMin, zoom), lightboxZoomMax)

    // 调整平移量以保持鼠标位置不变
    const zoomDelta = zoom - oldZoom
    translateX -= offsetX * zoomDelta
    translateY -= offsetY * zoomDelta

    updateTransform()
  })

  // 鼠标拖动
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === target || target.contains(e.target)) {
      isDragging = true
      startX = e.clientX - translateX
      startY = e.clientY - translateY
      target.style.cursor = 'grabbing'
      e.preventDefault()
      e.stopPropagation()
    }
  })

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault()
      translateX = e.clientX - startX
      translateY = e.clientY - startY
      updateTransform()
    }
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      target.style.cursor = 'grab'
    }
  })

  // 触摸双指缩放
  overlay.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    } else if (e.touches.length === 1) {
      isDragging = true
      startX = e.touches[0].clientX - translateX
      startY = e.touches[0].clientY - translateY
    }
  })

  overlay.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      let distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      zoom += (distance - lastDistance) * lightboxZoomSpeed
      zoom = Math.min(Math.max(lightboxZoomMin, zoom), lightboxZoomMax)
      updateTransform()
      lastDistance = distance
    } else if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX
      translateY = e.touches[0].clientY - startY
      updateTransform()
    }
  })

  overlay.addEventListener('touchend', () => {
    lastDistance = 0
    isDragging = false
  })

  // 设置初始光标样式
  target.style.cursor = 'grab'
}

postImages.forEach((image) => {
  image.addEventListener('click', () => {
    const lightbox_img = document.createElement('img')
    lightbox_img.src = image.src
    lightbox_img.classList.add('lightbox__img')
    lightbox_img.style.width = 'calc(min(100%,1000px))'
    lightbox_img.draggable = false

    const overlay = createOverlay(lightbox_img)
    lightbox_img.addEventListener('click', (e) => e.stopPropagation())
    enableZoom(overlay, lightbox_img)
  })
})

postMermaidCodes.forEach((mermaid) => {
  mermaid.addEventListener('click', () => {
    const lightbox_img = document.createElement('div')
    lightbox_img.innerHTML = mermaid.innerHTML
    lightbox_img.classList.add('lightbox__img')
    lightbox_img.style.width = 'calc(min(100%,1000px))'

    const lightbox_svg = lightbox_img.querySelector('svg')
    lightbox_svg.removeAttribute('width')
    lightbox_svg.removeAttribute('height')
    lightbox_svg.removeAttribute('style')
    lightbox_svg.style.width = 'calc(min(100%,1000px))'

    const overlay = createOverlay(lightbox_img)
    lightbox_img.addEventListener('click', (e) => e.stopPropagation())
    enableZoom(overlay, lightbox_img)
  })
})
