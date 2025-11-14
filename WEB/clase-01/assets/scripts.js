document.addEventListener("DOMContentLoaded", function(){
    
    const open = document.getElementById("open")
    const close = document.getElementById("close")
    const sidebar = document.getElementById("sidebar")
    const background = document.getElementById("sidebar-back")
    let isOpen = false

    open.addEventListener("click", function(){
        if(!isOpen){
            sidebar.style.transform = "translateX(0)";
            background.style.opacity = "1";
            background.style.pointerEvents = "all";

            isOpen = true
        }else {
            sidebar.style.transform = "translateX(300px)";
            background.style.opacity = "0";
            background.style.pointerEvents = "none";
            isOpen = false
        }
    })

    close.addEventListener("click", function(){
        if(!isOpen){
            sidebar.style.transform = "translateX(0)";
            background.style.opacity = "1";
            background.style.pointerEvents = "all";

            isOpen = true
        }else {
            sidebar.style.transform = "translateX(300px)";
            background.style.opacity = "0";
            background.style.pointerEvents = "none";

            isOpen = false
        }
    })

    background.addEventListener("click", function(){
        if(!isOpen){
            sidebar.style.transform = "translateX(0)";
            background.style.opacity = "1";
            background.style.pointerEvents = "all";

            isOpen = true
        }else {
            sidebar.style.transform = "translateX(300px)";
            background.style.opacity = "0";
            background.style.pointerEvents = "none";

            isOpen = false
        }
    })
})