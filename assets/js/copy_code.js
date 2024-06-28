document.querySelectorAll('pre:has(code)').forEach((element) => {
    element.addEventListener('click', () => {
        const code = element.querySelector('code').innerText;
        navigator.clipboard.writeText(code);
    });
});