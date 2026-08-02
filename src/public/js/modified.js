export class modifiedScript {
    constructor() {
        this.modifications = document.querySelectorAll("li:has(.modification)");

        for (var modification of this.modifications) {
            modification.querySelector(".modStar").addEventListener("mouseover", (e) => {
                e.currentTarget.nextElementSibling.classList.toggle("showMe");
            });
        }
    }
}