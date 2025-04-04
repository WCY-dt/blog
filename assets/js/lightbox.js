let images = document.querySelector('#post-content-container').querySelectorAll('img')

const ZoomSpeed = 0.001
const ZoomMax = 4
const ZoomMin = 0.1

images.forEach((image) => {
    image.addEventListener('click', (e) => {
        let lightbox_img = document.createElement('img')
        lightbox_img.src = image.src
        lightbox_img.classList.add('lightbox-img')
        lightbox_img.style.width = 'calc(min(100%,1000px))'

        let overlay = document.createElement('div')
        overlay.classList.add('lightbox-overlay')
        overlay.appendChild(lightbox_img)

        document.body.appendChild(overlay)

        overlay.addEventListener('click', () => {
            overlay.remove()
        })

        lightbox_img.addEventListener('click', (e) => {
            e.stopPropagation()
        })

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.remove()
            }
        })

        // Scroll to zoom
        let zoom = 1
        overlay.addEventListener('wheel', (e) => {
            e.preventDefault()
            zoom += e.deltaY * -ZoomSpeed
            zoom = Math.min(Math.max(ZoomMin, zoom), ZoomMax)
            lightbox_img.style.transform = `scale(${zoom})`
        })

        // Pinch to zoom
        let lastDistance = 0
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
                lightbox_img.style.transform = `scale(${zoom})`
                lastDistance = distance
            }
        })

        overlay.addEventListener('touchend', (e) => {
            lastDistance = 0
        })
    })
})

let mermaids = document.querySelectorAll('.language-mermaid')
mermaids.forEach((mermaid) => {
    mermaid.addEventListener('click', (e) => {
        // 将 mermaid 的内容转换为 SVG
        const svg = mermaid.innerHTML
        const lightbox_img = document.createElement('div')
        lightbox_img.innerHTML = svg
        lightbox_img.classList.add('lightbox-img')
        lightbox_img.style.width = 'calc(min(100%,1000px))'

        const lightbox_svg = lightbox_img.querySelector('svg')
        lightbox_svg.removeAttribute('width')
        lightbox_svg.removeAttribute('height')
        lightbox_svg.removeAttribute('style')
        lightbox_svg.style.width = 'calc(min(100%,1000px))'

        const overlay = document.createElement('div')
        overlay.classList.add('lightbox-overlay')
        overlay.appendChild(lightbox_img)
        document.body.appendChild(overlay)
        overlay.addEventListener('click', () => {
            overlay.remove()
        })
        lightbox_img.addEventListener('click', (e) => {
            e.stopPropagation()
        })
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.remove()
            }
        })
        // Scroll to zoom
        let zoom = 1
        overlay.addEventListener('wheel', (e) => {
            e.preventDefault()
            zoom += e.deltaY * -ZoomSpeed
            zoom = Math.min(Math.max(ZoomMin, zoom), ZoomMax)
            lightbox_img.style.transform = `scale(${zoom})`
        })
        // Pinch to zoom
        let lastDistance = 0
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
                lightbox_img.style.transform = `scale(${zoom})`
                lastDistance = distance
            }
        })
        overlay.addEventListener('touchend', (e) => {
            lastDistance = 0
        })
    })
})
