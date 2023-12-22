document.querySelectorAll('pre:has(code)').forEach((element) => {
    element.addEventListener('click', () => {
        const code = element.querySelector('code').innerText;
        navigator.clipboard.writeText(code).then(() => {
            console.log('Code copied to clipboard');
        }).catch(err => {
            console.error('Could not copy code: ', err);
        });
    });
});