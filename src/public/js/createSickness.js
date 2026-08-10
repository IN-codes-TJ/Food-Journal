export class createSickness {
    constructor() {
        this.addToSymptom = document.getElementById("symptoms");
        this.addToAssociation = document.getElementById("associatedFoods");

        var foodOptionsRaw = document.getElementById("foodOptions");
        this.foodOptions = JSON.parse(foodOptionsRaw.getAttribute("value"));
        
        this.listenForSymptomAdd("addSymptom");
        this.listenForAssociationAdd("addAssociatedFood");
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
            newInputElement.setAttribute("class", "border-underline");
            newInputElement.setAttribute("required", "");
            newInputElement.setAttribute("name", "symptoms[]");
            newDiv.appendChild(newInputElement);

            this.createDeletor(newDiv);

            this.addToSymptom.appendChild(newDiv);
        })
        return;
    }

    listenForAssociationAdd(elementId) {
        var target = document.getElementById(elementId);
        
        target.addEventListener("click", ()=>{
            var newDiv = document.createElement("div");

            var newIcon = document.createElement("img");
            newIcon.setAttribute("src", "./assets/plain.png");
            newIcon.setAttribute("alt", "An icon of a strawberry, linking to the create food page");
            newIcon.setAttribute("class", "icon h-2");
            newIcon.setAttribute("style", "mask-image: url('./assets/food-icon.png')");
            newDiv.appendChild(newIcon);

            var dropdown = document.createElement("select");
            dropdown.setAttribute("class", "w-full");
            dropdown.setAttribute("name", "associatedFoods[]");
            var option;
            for (var foodOption of this.foodOptions) {
                option = document.createElement("option");
                option.setAttribute("label", foodOption["name"]);
                option.setAttribute("value", foodOption["eatenid"]);

                dropdown.appendChild(option);
            }

            newDiv.appendChild(dropdown);

            this.createDeletor(newDiv);

            this.addToAssociation.appendChild(newDiv);
        })
        return;
    }
}