let pageTitle = document.getElementById("pageTitle");
let eventConnections = [];
if(pageTitle != null) {
    eventConnections.push(pageTitle.addEventListener("mouseover", (eventObject) => {
        pageTitle.style.color = "#004380";
    }))

    eventConnections.push(pageTitle.addEventListener("mouseout", (eventObject) => {
        pageTitle.style.color = "#00FF00";
    }))
}