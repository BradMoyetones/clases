let isOpen = false

function toggleSidebar() { 
    const sidebar = document.getElementById("sidebar")
    const background = document.getElementById("sidebar-back")
    sidebar.style.transform = !isOpen ? "translateX(0)" : "translateX(300px)";
    background.style.opacity = !isOpen ? "1" : "0";
    background.style.pointerEvents = !isOpen ? "all" : "none";
    isOpen = !isOpen ? true : false
}