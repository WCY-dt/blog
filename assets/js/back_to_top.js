const backToTopButton = document.querySelector("#sidebar__top-btn")

backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
})
