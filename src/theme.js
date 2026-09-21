const toggle = document.querySelector('.theme-toggle');

toggle.addEventListener('click', () => { // when clicked, turn dark/light
    const dark = document.body.classList.toggle('dark');
    toggle.textContent = dark ? 'dark' : 'light';
});
