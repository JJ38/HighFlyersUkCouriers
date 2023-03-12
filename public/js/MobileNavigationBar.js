const mobileNavToggle = document.getElementById('mobilenavtoggle');
const mobileNavMenu = document.getElementById('mobilenavmenu');
const closeMobileNavMenu = document.getElementById('closemobilenavmenu');

mobileNavToggle.addEventListener('click', e => {

    mobileNavMenu.classList.toggle('hideMobileMenu');

});

closeMobileNavMenu.addEventListener('click', e => {

    mobileNavMenu.classList.toggle('hideMobileMenu');

});