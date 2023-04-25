import { auth } from "./firebase.js"; // Importem l'objecte auth de firebase.js
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js"; // Importem la funcions de Firebase


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
     INICI DE SESSIÓ
*/
const signinForm = document.getElementById("signin-form"); // Referenciem el formulari d'inici de sessió

signinForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitem el funcionament per defecte de l'esdeveniment
    // Obtenim els valors dels camps del formulari:
    const email = signinForm["email"].value;
    const pass = signinForm["pass"].value;

    try {
        loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
        await signInWithEmailAndPassword(auth, email, pass);
        alert("Session successfully started");
        // Borrem els valors dels camps del formulari
        signinForm["email"].value = "";
        signinForm["pass"].value = "";
        // Tanquem la finestra:
        let go_back = document.querySelectorAll("[data-close]");
        go_back[0].click();

    } catch (error) {
        console.log(error);
        // Si dona error, gestionarem els missatge segons el codi d'aquest:
        switch (error.code) {
            case "auth/wrong-password":
                alert("Wrong password");
                signinForm["pass"].focus();
                break;
            case "auth/user-not-found":
                alert("User not found");
                signinForm["email"].focus();
                break;
            default:
                alert("Something went wrong: " + error.code);
        }
    }
    loading(false);
});


/*
     TANCAMENT DE SESSIÓ
*/
const logout = document.getElementById("logout-session");
logout.addEventListener("click", async () => {
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
    await signOut(auth);
    alert("Session clossed");
    loading(false);
});
/*
    ----------
*/



/*
     SESSIÓ INICIADA
*/
// Si tenim una sessió iniciada, mostrarem el botó de Log out i el email de la sessió.
// També tenim una part del codi que només serveix per anar comprovant el valor de la cookie "deleteAccount".
onAuthStateChanged(auth, (user) => {
    let session_name = document.getElementById("session-owner");
    let show = document.getElementsByClassName("login-display");
    let hide = document.getElementsByClassName("logout-display");

    if (user) {

        for (let item of show) {
            item.style.display = "block";
        }
        for (let item of hide) {
            item.style.display = "none";
        }
        session_name.innerText = user.email;
        // Guardem el email en una cookie per utilitzar-la després:
        document.cookie = "user= " + user.email;

        // CODI PER ACABAR D'ELIMINAR UN COMPTE D'USUARI
        // Fem un Array de l'String que guarda la informació de cookies:
        let cookie_list = document.cookie.split(";");
        // Cerquem el nom de la cookie que ens interessa dins l'Array.
        // En aquest cas ens interessa saber si la cookie de nom deleteAccount té valor "true" (volem eliminar l'usuari):
        for (let i in cookie_list) {
            let search = cookie_list[i].search("deleteAccount");
            // Si trobem la cookie, consultem que el seu valor sigui "true":
            if (search > -1) {
                let mycookie = cookie_list[i];
                let index = mycookie.indexOf("=");
                let cookie_value = mycookie.substring(index+1);

                if (cookie_value == "true") {
                    // Ens assegurem que realment es vol eliminar el compte:
                    let answer = confirm(`Do you want to delete your account? This action can not be undone...`);
                    // Si ha confirmat la petició:
                    if (answer) {
                        // Fem visible el formulari perquè confirmi l'eliminació del compte:
                        document.getElementById("delete-modal").classList.add(isVisible);
                    
                    } else {
                        // Sempre que hi hagi un error, farem "reset" a la cookie deleteAccount...
                        document.cookie = "deleteAccount=; max-age:-1";
                    }
                }
            }
        }

    } else {

        for (let item of show) {
            item.style.display = "none";
        }
        for (let item of hide) {
            item.style.display = "block";
        }
        // Borrem la cookie:
        document.cookie = "user=; max-age:-1";
        document.cookie = "deleteAccount=; max-age:-1";
    }
});
/*
    ----------
*/



/*
    EXECUTEM L'ELIMINACIÓ D'USUARI
*/
const deleteForm = document.getElementById("delete-form"); // Aquí estem referenciant al formulari per confirmar l'eliminació d'un usuari
// Amb "deleteForm" executem l'eliminació d'un usuari
deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitem el funcionament per defecte de l'esdeveniment
    // Obtenim els valors dels camps del formulari:
    const email = deleteForm["email2"].value;
    const pass = deleteForm["pass2"].value;
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // Borrem els valors dels camps del formulari
        deleteForm["email2"].value = "";
        deleteForm["pass2"].value = "";
        // Tanquem la finestra:
        let go_back = document.querySelectorAll("[data-close]");
        go_back[1].click();

        // Preparem la petició SQL per als items de la base de dades:
        let request = `DELETE FROM inventory WHERE email = "${email}";`;

        onAuthStateChanged(auth, (user) => {

            try {
                // Validem l'usuari amb les funcions importades des de Firebase:
                const credential = EmailAuthProvider.credential(email, pass);

                reauthenticateWithCredential(user, credential).then(() => {
                    
                    deleteUser(user).then(() => {
                        // Eliminem els items de la BBDD vinculats al email de l'usuari eliminat:
                        $.post("editItem.php", { request }, function(res) {
    
                            if (!res) {
                                alert("Ops! We got an error during the process. Try again...");
                        
                            } else {
                                alert("User deleted");
                            }
                        });
    
                        // Fem reset al valor de les cookies:
                        document.cookie = "deleteAccount=; max-age:-1";
                        document.cookie = "user=; max-age:-1";
    
                    }).catch((error) => {
                        alert("An error ocurred... " + error);
                        // Sempre que hi hagi un error, farem "reset" a la cookie deleteAccount...
                        document.cookie = "deleteAccount=; max-age:-1";
                    });
                });
    
            } catch (error) {
                console.log(error);
                alert("An error ocurred... " + error);
                // Sempre que hi hagi un error, farem "reset" a la cookie deleteAccount...
                document.cookie = "deleteAccount=; max-age:-1";
            }
        });

    } catch (error) {
        console.log(error);
        // Si dona error, gestionarem els missatge segons el codi d'aquest:
        switch (error.code) {
            case "auth/wrong-password":
                alert("Wrong password");
                deleteForm["pass"].focus();
                break;
            case "auth/user-not-found":
                alert("User not found");
                deleteForm["email"].focus();
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