"use strict";

let openMenuEl = document.getElementById("open-menu");
let closeMenuEl = document.getElementById("close-menu");
let menuEl = document.getElementById("menu");


let menutextopenEl = document.querySelector(".menutextopen");
let bar1El = document.querySelector(".bar1");
let bar2El = document.querySelector(".bar2");
let bar3El = document.querySelector(".bar3");


let menutextcloseEl = document.querySelector(".menutextclose");
let bar1closeEl = document.querySelector(".bar1close");
let bar2closeEl = document.querySelector(".bar2close");
let bar3closeEl = document.querySelector(".bar3close");


openMenuEl.addEventListener("mouseover", hoverOpen);
closeMenuEl.addEventListener("mouseover", hoverClose);

openMenuEl.addEventListener("mouseout", hoverOpen2);
closeMenuEl.addEventListener("mouseout", hoverClose2);

openMenuEl.addEventListener("click", toggleMenu);
closeMenuEl.addEventListener("click", toggleMenu);



function toggleMenu() {

    if (window.getComputedStyle(menuEl).display === "none" && window.matchMedia("(max-width: 800px)").matches) {
        menuEl.style.display = "flex";
        openMenuEl.style.display = "flex";
        closeMenuEl.style.display = "none";

        openMenuEl.style.animationPlayState = "running";
        bar1El.style.animationPlayState = "running";
        bar2El.style.animationPlayState = "running";
        bar3El.style.animationPlayState = "running";
        menutextopenEl.style.animationPlayState = "running";
        menutextopenEl.innerHTML = "Stäng";

        closeMenuEl.style.animationPlayState = "paused";
        bar1closeEl.style.animationPlayState = "paused";
        bar2closeEl.style.animationPlayState = "paused";
        bar3closeEl.style.animationPlayState = "paused";
        menutextcloseEl.style.animationPlayState = "paused";
      
        showMenu()

    } else if (window.getComputedStyle(menuEl).display === "flex" && window.matchMedia("(max-width: 800px)").matches) {
        openMenuEl.style.display = "none";
        closeMenuEl.style.display = "flex";

        closeMenuEl.style.animationPlayState = "running";
        bar1closeEl.style.animationPlayState = "running";
        bar2closeEl.style.animationPlayState = "running";
        bar3closeEl.style.animationPlayState = "running";
        menutextcloseEl.style.animationPlayState = "running";
        menutextcloseEl.innerHTML = "Meny";
  
        openMenuEl.style.animationPlayState = "paused";
        bar1El.style.animationPlayState = "paused";
        bar2El.style.animationPlayState = "paused";
        bar3El.style.animationPlayState = "paused";
        menutextopenEl.style.animationPlayState = "paused";

        hideMenu()
    } 
    window.addEventListener("resize", noHamburger);
}


function noHamburger() {
    
    if (window.matchMedia("(min-width: 800px)").matches) {
        menuEl.style.display = "flex";
        openMenuEl.style.display = "none";
        closeMenuEl.style.display = "none";

    } else {
        menuEl.style.display = "none";
        openMenuEl.style.display = "none";
        closeMenuEl.style.display = "flex";
        closeMenuEl.style.animationPlayState = "running";
        bar1closeEl.style.animationPlayState = "running";
        bar2closeEl.style.animationPlayState = "running";
        bar3closeEl.style.animationPlayState = "running";
        menutextcloseEl.style.animationPlayState = "running";
        menutextcloseEl.innerHTML = "Meny";
    }
}


function showMenu() {
    menuEl.style.animationPlayState = "running";
}

function hideMenu() {
    menuEl.style.animationName = "hidemenu";
    menuEl.style.animationPlayState = "running";

    setTimeout(closeMenu, 500)
}

function closeMenu() {
    menuEl.style.display = "none";
    menuEl.style.animationName = "showmenu";
}


function hoverOpen() {
    if (window.getComputedStyle(menuEl).display === "none") {
        openMenuEl.style.boxShadow ="0px 2px 8px white";
    } else {
        openMenuEl.style.boxShadow ="0px 2px 8px red";
    }   
}

function hoverClose() {
   if (window.getComputedStyle(openMenuEl).display === "none") {
        closeMenuEl.style.boxShadow ="0px 2px 8px white";
    } else {
        closeMenuEl.style.boxShadow ="0px 2px 8px red";
    }
}

function hoverOpen2() {
    openMenuEl.style.boxShadow ="none";
}
    
function hoverClose2() {
    closeMenuEl.style.boxShadow ="none";
}





