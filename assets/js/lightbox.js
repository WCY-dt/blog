// Select all images inside the post wrapper
let postImages = document.querySelector('#post-wrapper').querySelectorAll('img');
// Select all Mermaid code blocks
let postMermaidCodes = document.querySelectorAll('.language-mermaid');

// Constants for lightbox zoom functionality
const lightboxZoomSpeed = 0.001; // Speed of zooming
const lightboxZoomMax = 4; // Maximum zoom level
const lightboxZoomMin = 0.1; // Minimum zoom level

// Function to create an overlay for the lightbox
function createOverlay(content) {
  const overlay = document.createElement('div');
  overlay.classList.add('lightbox-wrapper');
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Close the overlay when clicked or when the Escape key is pressed
  overlay.addEventListener('click', () => overlay.remove());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.remove();
  });

  return overlay;
}

// Function to enable zoom and drag functionality for the lightbox
function enableZoom(overlay, target) {
  let zoom = 1; // Initial zoom level
  let lastDistance = 0; // Last distance for touch zoom
  let translateX = 0; // Horizontal translation
  let translateY = 0; // Vertical translation
  let isDragging = false; // Dragging state
  let startX = 0; // Initial X position for dragging
  let startY = 0; // Initial Y position for dragging

  // Function to update the transform property of the target
  function updateTransform() {
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  }

  // Mouse wheel zoom (centered on the mouse position)
  overlay.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Get the mouse position relative to the viewport
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate the mouse position relative to the image (considering current translation and zoom)
    const rect = target.getBoundingClientRect();
    const offsetX = (mouseX - rect.left - rect.width / 2) / zoom;
    const offsetY = (mouseY - rect.top - rect.height / 2) / zoom;

    // Calculate the new zoom level
    const oldZoom = zoom;
    zoom += e.deltaY * -lightboxZoomSpeed;
    zoom = Math.min(Math.max(lightboxZoomMin, zoom), lightboxZoomMax);

    // Adjust translation to keep the mouse position fixed
    const zoomDelta = zoom - oldZoom;
    translateX -= offsetX * zoomDelta;
    translateY -= offsetY * zoomDelta;

    updateTransform();
  });

  // Mouse drag functionality
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === target || target.contains(e.target)) {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      target.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      target.style.cursor = 'grab';
    }
  });

  // Touch-based pinch zoom
  overlay.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  });

  overlay.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      let distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      zoom += (distance - lastDistance) * lightboxZoomSpeed;
      zoom = Math.min(Math.max(lightboxZoomMin, zoom), lightboxZoomMax);
      updateTransform();
      lastDistance = distance;
    } else if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      updateTransform();
    }
  });

  overlay.addEventListener('touchend', () => {
    lastDistance = 0;
    isDragging = false;
  });

  // Set the initial cursor style
  target.style.cursor = 'grab';
}

// Add lightbox functionality to all post images
postImages.forEach((image) => {
  image.addEventListener('click', () => {
    const lightbox_img = document.createElement('img');
    lightbox_img.src = image.src;
    lightbox_img.classList.add('lightbox__img');
    lightbox_img.style.width = 'calc(min(100%,1000px))';
    lightbox_img.draggable = false;

    const overlay = createOverlay(lightbox_img);
    lightbox_img.addEventListener('click', (e) => e.stopPropagation());
    enableZoom(overlay, lightbox_img);
  });
});

// Add lightbox functionality to all Mermaid code blocks
postMermaidCodes.forEach((mermaid) => {
  mermaid.addEventListener('click', () => {
    const lightbox_img = document.createElement('div');
    lightbox_img.innerHTML = mermaid.innerHTML;
    lightbox_img.classList.add('lightbox__img');
    lightbox_img.style.width = 'calc(min(100%,1000px))';

    const lightbox_svg = lightbox_img.querySelector('svg');
    lightbox_svg.removeAttribute('width');
    lightbox_svg.removeAttribute('height');
    lightbox_svg.removeAttribute('style');
    lightbox_svg.style.width = 'calc(min(100%,1000px))';

    const overlay = createOverlay(lightbox_img);
    lightbox_img.addEventListener('click', (e) => e.stopPropagation());
    enableZoom(overlay, lightbox_img);
  });
});
