const themeButton = document.querySelector('.theme-toggle');

themeButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    themeButton.textContent = isDark ? 'dark' : 'light';
});
