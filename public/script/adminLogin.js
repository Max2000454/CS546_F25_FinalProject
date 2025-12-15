var loginForm = document.getElementById("loginForm");
var errorContainer = document.getElementById("error");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {

        var usernameInput = document.getElementById("username");
        var passwordInput = document.getElementById("password");

        var username = usernameInput.value;
        var password = passwordInput.value;

        var output = "";

        if (!username) {
            output = "Username required";
        }

        if (!password) {
            if (output) {
                output = output + ", password required";
            } else {
                output = "Password required";
            }
        }

        if (output) {
            event.preventDefault();
            errorContainer.innerHTML = "<p>" + output + "</p>";
            return;
        }
    });
}
