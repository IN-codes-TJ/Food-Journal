
export class insertItem {
    constructor() {
        this.addToSymptom = document.getElementById("symptoms");
        this.addToAssociation = document.getElementById("associatedFoods");
        this.count = 0;
    }

    createDeletor(newDiv) {
        // Used to delete the newly added list element
        var deleterElementDiv = document.createElement("div");
        deleterElementDiv.setAttribute("class", "icon-parent h-2");

        deleterElementDiv.addEventListener("click", (e)=>{
            e.target.parentElement.parentElement.remove();
        })

        var deleterElementImg = document.createElement("img");
        deleterElementImg.setAttribute("src", "./assets/plain.png");
        deleterElementImg.setAttribute("alt", "A bin icon to delete an item");
        deleterElementImg.setAttribute("class", "icon");
        deleterElementImg.setAttribute("style", "mask-image: url('./assets/Delete-Icon.png')");

        deleterElementDiv.appendChild(deleterElementImg);
        newDiv.appendChild(deleterElementDiv);
    }

    listenForSymptomAdd(elementId) {
        var target = document.getElementById(elementId);
        
        target.addEventListener("click", ()=>{
            var newDiv = document.createElement("div");

            var newInputElement = document.createElement("input");
            newInputElement.setAttribute("type", "text");
            newInputElement.setAttribute("name", "symptom"+this.count);
            this.count++;
            newInputElement.setAttribute("class", "border-underline");
            newDiv.appendChild(newInputElement);

            this.createDeletor(newDiv);

            this.addToSymptom.appendChild(newDiv);
        })
        return;
    }

    listenForAssociationAdd(elementId) {
        var target = document.getElementById(elementId);
        //var dropdownItems = from a model;
        
        target.addEventListener("click", ()=>{
            var newDiv = document.createElement("div");

            var newIcon = document.createElement("img");
            newIcon.setAttribute("src", "./assets/plain.png");
            newIcon.setAttribute("alt", "An icon of a strawberry, linking to the create food page");
            newIcon.setAttribute("class", "icon h-2");
            newIcon.setAttribute("style", "mask-image: url('./assets/food-icon.png')");
            newDiv.appendChild(newIcon);

            var newInputElement = document.createElement("input");
            newInputElement.setAttribute("type", "text");
            newInputElement.setAttribute("name", "symptom"+this.count);
            this.count++;
            newInputElement.setAttribute("class", "border-underline");
            newDiv.appendChild(newInputElement);

            this.createDeletor(newDiv);

            this.addToAssociation.appendChild(newDiv);
        })
        return;
    }
}