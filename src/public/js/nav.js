export class navScripts {
    constructor() {
        this.hamburger = document.getElementById("hamburger");
        this.toToggle = document.getElementById("navToggle");
  
        this.hamburger.addEventListener("click", (e) => {
            this.toToggle.classList.toggle("hidden");
            this.hamburger.parentElement.classList.toggle("hiddenNavHamb");
        });

        this.create = document.getElementById("create-icon");
        this.createOptions = document.getElementById("create-options")

        this.create.addEventListener("click", (e) => {
            this.createOptions.classList.toggle("showCreateOptions");
        });
    }
}