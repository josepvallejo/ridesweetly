/*
    CÀRREGA, INSERCIÓ I ELIMINACIÓ D'ÍTEMS DE L'INVENTARI DE L'USUARI
*/


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



// Funció per carregar l'inventari disponible de l'usuari:
function getItems() {
    // Primer, insertem el títol amb la direcció corresponent:
    let content = document.getElementById("content");
    let cookie_list = document.cookie.split(";");
    for (let i in cookie_list) {
        let search = cookie_list[i].search("user");
        // Si trobem la cookie, consultem el seu valor":
        if (search > -1) {
            let mycookie = cookie_list[i]
            let index = mycookie.indexOf("=");
            var cookie_value = mycookie.substring(index+1);
        }
    }
    let email = cookie_value;
    content.insertAdjacentHTML("afterbegin", "<h2>Welcome to your dashboard, </br>" + email + "</h2>");

    let request = `SELECT * FROM inventory WHERE email="${email}" ORDER BY type`;
    
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació

    $.get("getItems.php", { request }, function(res) {
        if (!res) {
            alert("Ops! We got an error during the process. Try again...");
    
        } else {
            let inventory = document.getElementById("inventory");
            let finalRes = "";
            jsonRes = JSON.parse(res);
            
            for (let item of jsonRes) {
                finalRes += `<ul><li data-id="${item.id}" class="piece-type">${item.type}</li><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li><li class="delete-piece"><button type="button" class="button delete-button">Delete</button></li></ul>`;
            }

            inventory.insertAdjacentHTML("beforeend", finalRes);
        }
    });
    loading(false);
}

// Funcions per insertar un ítem a l'inventari de l'usuari:
const insertForm = document.getElementById("add-piece-form");
insertForm.addEventListener("submit", e => {
    e.preventDefault();
    // Aquí només cerquem la direcció email de l'usuari que s'ha guardat a les cookies:
    let cookie_list = document.cookie.split(";");

    for (let i in cookie_list) {
        let search = cookie_list[i].search("user");
        // Si trobem la cookie, consultem el seu valor":
        if (search > -1) {
            let mycookie = cookie_list[i]
            let index = mycookie.indexOf("=");
            var cookie_value = mycookie.substring(index+1);
        }
    }
    
    let email = cookie_value;
    let type = document.getElementById("select-type").value;
    let name = document.getElementById("item-name").value;
    let min_temp = document.getElementById("item-mintemp").value;
    let max_temp = document.getElementById("item-maxtemp").value;
    let request = "INSERT INTO inventory (`id`, `email`, `type`, `name`, `mintemp`, `maxtemp`) VALUES (NULL, '"+email+"', '"+type+"', '"+name+"', '"+min_temp+"', '"+max_temp+"');";
    
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació

    $.post("editItem.php", { request }, function(res) {
        
        if (!res) {
            alert("Ops! We got an error during the process. Try again...");
    
        } else {
            alert("Item added to your inventory!");
            location.reload();
        }
    });
    loading(false);
});
// Funcions per eliminar un ítem a l'inventari de l'usuari:
document.addEventListener("click", (e) => {
    let clickedItem = e.target;

    if (!clickedItem.matches(".delete-button")) {
        return;
    };

    clickedItem = clickedItem.parentNode.parentNode.firstChild;
    let item_id = clickedItem.getAttribute("data-id");
    let item_name = clickedItem.nextSibling.outerText;
    let request = `DELETE FROM inventory WHERE id = ${item_id};`;
    let answer = confirm(`Do you want to delete ${item_name} from your inventory?`);

    if (answer) {
        loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
        $.post("editItem.php", { request }, function(res) {
        
            if (!res) {
                alert("Ops! We got an error during the process. Try again...");
        
            } else {
                alert("Item deleted from your inventory!");
                location.reload();
            }
        });
        loading(false);
    }
});
/*
    ----------
*/


/*
    S'EXECUTA L'ELIMINACAIÓ D'USUARI
*/
const deleteAccount = document.getElementById("delete-account-button");
deleteAccount.addEventListener("click", () => {
    // Creem la cookie que recollirem després per validar l'eliminació del compte:
    document.cookie = "deleteAccount=true";
    // Anem a la pàgina principal:
    let go_back = document.getElementById("go-back-button");
    go_back.click();
});
/*
    ----------
*/