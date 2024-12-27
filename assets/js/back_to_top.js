const backToTopButton = document.querySelector("#back-to-top-button")

backToTopButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
    }
)
