const glitchText = document.querySelector(".glitch");
if (glitchText) {
    setInterval(() => {
        glitchText.style.textShadow = `${Math.random() * 5}px ${Math.random() * 5}px 0px #7676f7, ${-Math.random() * 5}px ${-Math.random() * 5}px 0px #7676f7`;
    }, 200);
}

document.querySelectorAll(".go-back").forEach(button => {
    button.addEventListener("click", (event) => {
        event.preventDefault();
        window.history.back();
    });
});