let dk = document.getElementById('checkboxs');
let interfaces = document.getElementsByClassName('container');
document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';


setTimeout(() => {
    // Hide elements with class 'interface'
    for (let i = 0; i < interfaces.length; i++) {
        interfaces[i].style.display = 'none';
    }
}, 1500);

dk.addEventListener('change',()=>{
    if(dk.checked){
        document.body.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    }
    else{
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
})