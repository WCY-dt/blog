const backToTopButton = document.querySelector("#sidebar__top-btn")

backToTopButton.addEventListener("click", () => {
  // Smoothly scroll the window to the top of the page
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
})
