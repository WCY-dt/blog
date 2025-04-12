let images = document.querySelector('#post-content-container').querySelectorAll('img')
let mermaids = document.querySelectorAll('.language-mermaid')

const ZoomSpeed = 0.001
const ZoomMax = 4
const ZoomMin = 0.1

function createOverlay(content) {
    const overlay = document.createElement('div')
    overlay.classList.add('lightbox-overlay')
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

    overlay.addEventListener('wheel', (e) => {
        e.preventDefault()
        zoom += e.deltaY * -ZoomSpeed
        zoom = Math.min(Math.max(ZoomMin, zoom), ZoomMax)
        target.style.transform = `scale(${zoom})`
    })

    overlay.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
        }
    })

    overlay.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            let distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            zoom += (distance - lastDistance) * ZoomSpeed
            zoom = Math.min(Math.max(ZoomMin, zoom), ZoomMax)
            target.style.transform = `scale(${zoom})`
            lastDistance = distance
        }
    })

    overlay.addEventListener('touchend', () => {
        lastDistance = 0
    })
}

images.forEach((image) => {
    image.addEventListener('click', () => {
        const lightbox_img = document.createElement('img')
        lightbox_img.src = image.src
        lightbox_img.classList.add('lightbox-img')
        lightbox_img.style.width = 'calc(min(100%,1000px))'

        const overlay = createOverlay(lightbox_img)
        lightbox_img.addEventListener('click', (e) => e.stopPropagation())
        enableZoom(overlay, lightbox_img)
    })
})

mermaids.forEach((mermaid) => {
    mermaid.addEventListener('click', () => {
        const lightbox_img = document.createElement('div')
        lightbox_img.innerHTML = mermaid.innerHTML
        lightbox_img.classList.add('lightbox-img')
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
