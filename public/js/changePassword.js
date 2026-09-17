var passwordElement = document.getElementById("accPassword");
var confirmPasswordElement = document.getElementById("accChangePassword");
var confirmPasswordDiv = document.getElementById("accChangePWDiv");

passwordElement.addEventListener("input", (e) => {
    // When their is an input in the password element, show the confirm password element
    // and ensure that it is required (otherwise, hide the confirm password element and
    // ensure it is not required)
    if (e.target.value.length > 0 && confirmPasswordDiv.classList.contains("hidden")) {
        confirmPasswordDiv.classList.remove("hidden");
        confirmPasswordElement.setAttribute("required", "");
    }
    else if (e.target.value.length == 0 && confirmPasswordDiv.classList.contains("hidden") != true) {
        confirmPasswordDiv.classList.add("hidden");
        confirmPasswordElement.removeAttribute("required");
    }
})