document.addEventListener("DOMContentLoaded", function(){
    var filterButton = document.getElementById("filterButton");
    var filterInput = document.getElementById("filterInput");
    var contracts = document.getElementsByClassName("contract");

    filterButton.addEventListener("click", function(){
        var query = filterInput.value.toLowerCase();

        for(var x=0;x<contracts.length;x++){
            var title = contracts[x].getAttribute("data-title").toLowerCase();
            var description = contracts[x].getAttribute("data-description").toLowerCase();

            if(title.includes(query) || description.includes(query)){
                contracts[x].style.display = "block";
            }else{
                contracts[x].style.display = "none";
            }
        }
    });
});
