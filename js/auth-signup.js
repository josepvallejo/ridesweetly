// Importem la funció necessària per crear i autenticar usuaris:
import { createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { auth } from "./firebase.js"; // Importem l'objecte auth de firebase.js



/*
    -----MOSTRAR ICONA DE CÀRREGA-----
*/
const loading = (val) => {

    let el = document.getElementsByClassName("loading");

    if (val == true) {
        el[0].style.visibility = "visible";
    
    } else {
        el[0].style.visibility = "hidden";
    }
};
/*
    ----------
*/





/*
     REGISTRE DE NOUS USUARIS
*/
const signupForm = document.getElementById("signup-form"); // Referenciem el formulari de registre d'usuari

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitem el funcionament per defecte de l'esdeveniment
    // Obtenim els valors dels camps del formulari:
    const email = signupForm["email"].value;
    const pass = signupForm["pass"].value;
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("New user added successfully");
        // Tancarem la sessió iniciada i redireccionarem a la pàgina inicial:
        signOut(auth);
        let go_back = document.getElementById("cancel-button");
        go_back.click(); // Tornem a la pàgina inicial

    } catch (error) {
        console.log(error);
        // Si dona error, gestionarem els missatge segons el codi d'aquest:
        switch (error.code) {
            case "auth/email-already-in-use":
                alert("Email already in use");
                signupForm["email"].focus();
                break;
            case "auth/invalid-email":
                alert("Invalid email");
                signupForm["email"].focus();
                break;
            case "auth/weak-password":
                alert("Weak password");
                signupForm["pass"].focus();
                break;
            default:
                alert("Something went wrong: " + error.code);
        }
    }
    loading(false);
});
/*
    ----------
*/