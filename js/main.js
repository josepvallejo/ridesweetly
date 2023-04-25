/*
    -----MOSTRAR ICONA DE CÀRREGA-----
*/
const loading = (val) => {

    let el = document.getElementsByClassName("loading");

    if (val == true) {
        el[1].style.visibility = "visible";
    
    } else {
        el[1].style.visibility = "hidden";
    }
};
/*
    ----------
*/





/*
    -----OBTENIR GEOLOCALITZACIÓ DEL NAVEGADOR-----
*/
// Inicialitzem variables per guardar més endavant les coordenades de posicionament:
var lat;
var lng;
// I més variables per emmagatzemar resultats de les crides a l'API de previsió del temps:
var temp = new Array();
var wind = new Array();
var weather = new Array();
var place;

// Establim el posicionament inicial del dispositiu a través de la geolocalització del navegador:
setPosition();
function setPosition() {
    // Si el navegador permet la geolocalització, disparem el mètode getCurrentPosition():
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
    // Si el navegador no permet la geolocalització, disparem directament error():
    } else {
        error();
    }
};

var options = {
    EnableHighAccuracy: true, // Habilitem un posicionament acurat.
    Timeout: 3000, // Establim 3 segons com a temps d'espera màxim.
    MaximunAge: 0 // Establim que volem el posicionament actual.
};

// Si tot és correcte i se'ns permet obtenir la geolocalització, es dispara success():
function success(geolocationPosition) {
    // Obtenim els paràmetres de latitud i longitud de l'objecte geolocationPosition (coords.latitude i coords.longitude):
    lat = geolocationPosition.coords.latitude;
    lng = geolocationPosition.coords.longitude;

    initMap(lat, lng);
    updateUrlWeatherCall(); // Actualitzem la URL de la petició a Open Weather Map amb les dades de posicionament donades.
};

// Si no es pot obtenir la geolocalització del navegador, s'adverteix a l'usuari i indiquem un posicionament per defecte (en aquest cas, el de la ciutat de Nova York):
function error(err) {
    lat = 40.7142700;
    lng = -74.0059700;

    initMap(lat, lng);
    updateUrlWeatherCall(); // Actualitzem la URL de la petició a Open Weather Map amb les dades de posicionament donades.

    alert("We can't get your position!");
};
/*
    ----------
 */




/*
    CARREGAR MAPA AMB LA GEOLOCALITZACIÓ DELS PUNTS (MARCADORS) SELECCIONATS
*/
function initMap(x, y) {
    let map;
    let location = { lat: x, lng: y };
    let marker;

    if (x != undefined) { // Esperem a que arribi un valor vàlid abans d'executar la funció.
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: x, lng: y }, // Centrem el mapa en aquesta posició.
            zoom: 14, // Indiquem el zoom del mapa.
        });
        
        // Afegim el marcador:
        addMarker(location, map);

        // Cada vegada que fem click amb el ratolí sobre el mapa, afegirem un nou marcador:
        google.maps.event.addListener(map, "click", (event) => {
            marker.setMap(null); // Primer, eliminem el marcador existent.
            addMarker(event.latLng, map);
            // Actualitzem la localització:
            lat = event.latLng.lat();
            lng = event.latLng.lng();
            location.lat = lat;
            location.lng = lng;
            updateUrlWeatherCall();
        });

        // Definim i situem un marcador:
        function addMarker(location, map) {
            marker = new google.maps.Marker({
                position: location,
                map: map
            });
        };
    }
};
/*
    ----------
*/




/*
    PREVISIÓ DEL TEMPS: OPEN WEATHER API
*/
const forecast_button = document.getElementById("forecast-button");
const apiWeatherKey = "21e97e7de27fce68c74d289d2869e067"; // Clau API necessària per executar cada petició.
var url;
// Funció per actualitzar el valor de la variable url:
function updateUrlWeatherCall() {
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&cnt=2&appid=${apiWeatherKey}&units=metric`; // URL per accedir a l'API. Conté els paràmetres de geolocalització (lat, lng) i la clau API.
}
// Funció fletxa per executar la petició AJAX i obtenir la informació de l'API
var be_safe = true; // Aquesta variable la utitlitzarem per determinar si la previsió és segura.
var add_danger = false; // Aquesta variable la utitlitzarem per marcar una previsió insegura.
const getWeatherInfo = async () => {
    loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
    try {
        const response = await fetch(url, {cache: "no-cache"}); // Ens assegurem que no aprofiti res del cache.
        // Si la resposta és correcte:
        if (response.ok) {
            const jsonResponse = await response.json(); // Obtenim la resposta en format json.
            // A continuació obtenim la temperatura, el valor principal del paràmetre "weather", i el vent.
            // Com es pot comprovar, agafem un valor inicial (valor actual) i un de final (valor al cap de 3 hores):
            let initial_temp = jsonResponse.list[0].main.feels_like;
            let final_temp = jsonResponse.list[1].main.feels_like;
            let initial_weather = jsonResponse.list[0].weather[0].main;
            let final_weather = jsonResponse.list[1].weather[0].main;
            let initial_wind = jsonResponse.list[0].wind.gust;
            let final_wind = jsonResponse.list[1].wind.gust;
            let city = jsonResponse.city.name;
            add_danger = false;
            // Comprovem si les dades obtingudes són segures per sortir en bici:
            checkTemp(initial_temp);
            checkTemp(final_temp);
            checkWeather(initial_weather);
            checkWeather(final_weather);
            checkWind(initial_wind);
            checkWind(final_wind);
            // A continuació insertem les dades del punt marcat per mostrar-lo a la pàgina:
            let results = document.getElementById("forecast-results");
            let point = document.createElement("article");
            point.className = "point";
            let content_point = `<h2>${city}</h2><div class="weather-info"><div><h3>Now</h3><p>${initial_temp}&deg</p><p>${initial_wind} m/s</p><p>${initial_weather}</p></div><div><h3>+3h</h3><p>${final_temp}&deg</p><p>${final_wind} m/s</p><p>${final_weather}</p></div></div>`;
            point.insertAdjacentHTML("beforeend", content_point);
            // Si alguna dada no és segura afegim la classe .danger:
            if (add_danger) {
                point.className = "danger";
            }
            // Si encara no hem introduït cap previsió, afegim un element <h2> i el botó per fer reset:
            if (results.children.length != 0) {
                results.insertAdjacentHTML("beforeend", "<h2>Added points</h2>");
                let reset = document.getElementById("reset-points-container");
                reset.style.display = "inline-block";
            }
            // Insertem la informació a la pàgina:
            results.appendChild(point);            
            // Funcions per determinar si és segur sortir en bici:
            function checkTemp(x) {
                // Si la temperatura excedeix els 35 graus:
                if (x > 35) {
                    be_safe = false;
                    add_danger = true;
                }
                // Si la temperatura baixa dels -10 graus:
                if (x < -10) {
                    be_safe = false;
                    add_danger = true;
                }
            }
            function checkWeather(x) {
                // Tot el que no sigui ennuvolat o clar tindrà risc per l'usuari:
                if (x != "Clouds" && x != "Clear") {
                    be_safe = false;
                    add_danger = true;
                }
            }
            function checkWind(x) {
                // Si la velocitat és superior a 10,8 m/s:
                if (x > 10.8) {
                    be_safe = false;
                    add_danger = true;
                }
            }
            // Insertem les dades dins de variables per poder-les utilitzar posteriorment:
            temp.push(initial_temp, final_temp);
            wind.push(initial_wind, final_wind);
            weather.push(initial_weather, final_weather);
            place = city;
        }
    // Si torna un error el mostrem a la consola:
    } catch (error) {
        console.log(error);
    }
    loading(false);
};
forecast_button.addEventListener("click", getWeatherInfo);

// Funció per fer reset dels punts que s'han anat afegint per fer forecast:
const reset_points_button = document.getElementById("reset-points-button");
function resetPoints() {
    let results = document.getElementById("forecast-results");
    let reset = document.getElementById("reset-points-container");
    reset.style.display = "none";
    results.innerHTML = "";
    temp = new Array();
    wind = new Array();
    weather = new Array();
    place = "";
    be_safe = true;
    add_danger = false;
}
reset_points_button.addEventListener("click", resetPoints);
/*
    ----------
*/




/*
    OBTENCIÓ DE DADES DE L'USUARI
*/
const outfit_button = document.getElementById("outfit-button");
// Funció per gestionar la informació obtinguda de la previsió del temps i accedir a la base de dades:
const getOutfitInfo = () => {
    
    if (temp.length == 0) { // Si no s'ha marcat cap punt al mapa, no podrem fer la petició a la base de dades.
        alert("You need to set at least one point");
    
    } else {
        // Primer mirarem si hi ha un usuari connectat observant el valor de la cookie "user":
        let cookie_list = document.cookie.split(";");

        for (let i in cookie_list) {
            let search = cookie_list[i].search("user");
            // Si trobem la cookie, consultem el seu valor":
            if (search > -1) {
                let mycookie = cookie_list[i];
                let index = mycookie.indexOf("=");
                var cookie_value = mycookie.substring(index+1);
            }
        }
        // Si la cookie té valor, executarem la resta d'accions. En cas contrari, farem l'advertència:
        if (cookie_value == "") {
            alert("You need to be logged!");

        } else {

            let answer = true;
            // Si la previsió del temps no és segura, fem una alerta esperant confirmació o no de l'usuari:
            if (!be_safe) {
                answer = confirm("Some of the places you marked have bad weather forecasting. We recommend you stay safe.");
            }
            
            if (answer) {
                // Agafem els valors màxims i mínims de vent i temperatura, ja que són els únics que utilitzarem:
                let max_temp = Math.max(...temp);
                let min_temp = Math.min(...temp);
                let avg_temp = (max_temp + min_temp)/2; // Obtenim la mitja de les temperatures, que serà la que utilitzarem per filtrar els ítems de la base de dades.
                let request = "";
                // Obtenim el email de l'usuari, que l'utilitzem per fer la cerca a la BBDD:
                let email = cookie_value;
            
                // Si la temperatura és superior a 20 graus, es descartaran les categories que són més per l'hivern: Neck, Overshoes i Cap:
                if (avg_temp < 20) {
                    request = `(SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Jersey" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Bib" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Layer" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Gloves" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Socks" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Neck" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Overshoes" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Cap" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Other") ORDER BY dif;`;
                } else {
                    request = `(SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Jersey" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Bib" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Layer" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Gloves" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Socks" LIMIT 2) UNION (SELECT type, name, mintemp, maxtemp, ABS((mintemp + maxtemp) / 2 - ${avg_temp}) dif FROM inventory WHERE email="${email}" AND type = "Other") ORDER BY dif;`;
                }
                loading(true); // Executem la funció que mostra el GIF mentre es carrega la informació
                // Es llença la petició a la base de dades:
                $.get("getItems.php", { request }, function(res) {
                    // Si la connexió no és possible, es llença un avís:
                    if (!res) {
                        alert("Ops! We got an error during the process. Try again...");
                    // Si la connexió és correcte:
                    } else {
                        // Inicialitzem variables i els Arrays que utilitzarem per anar guardant la informació de cada ítem per tipus.
                        let content = document.getElementById("content");
                        let finalRes = "<h2 id='sweet-title'>Sweet recommendation:</h2>";
                        let jerseyRes = new Array();
                        let bibRes = new Array();
                        let layerRes = new Array();
                        let glovesRes = new Array();
                        let socksRes = new Array();
                        let neckRes = new Array();
                        let capRes = new Array();
                        let shoesRes = new Array();
                        let otherRes = new Array();
                        // La primera posició de cada Array serà el títol del tipus de peça:
                        jerseyRes.push("<h2 class='type-title'>Jersey</h2>");
                        bibRes.push("<h2 class='type-title'>Bib</h2>");
                        layerRes.push("<h2 class='type-title'>Layer</h2>");
                        glovesRes.push("<h2 class='type-title'>Gloves</h2>");
                        socksRes.push("<h2 class='type-title'>Socks</h2>");
                        neckRes.push("<h2 class='type-title'>Neck protection</h2>");
                        capRes.push("<h2 class='type-title'>Cap</h2>");
                        shoesRes.push("<h2 class='type-title'>Overshoes</h2>");
                        otherRes.push("<h2 class='type-title'>Other</h2>");
                        jsonRes = JSON.parse(res); // Obtenim la resposta de la consulta en format JSON.
                        // Recorrem la resposta de la consulta i anem guardant la informació de cada ítem a l'Array corresponent:
                        for (let item of jsonRes) {
                            if (item.dif < 10) {
                                switch (item.type) {
                                    case "Jersey":
                                        jerseyRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                    case "Bib":
                                        bibRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                    case "Layer":
                                        layerRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                    case "Gloves":
                                        glovesRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                    case "Socks":
                                        socksRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                    case "Neck":
                                        if (avg_temp < 20) {
                                            neckRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        }
                                        break;
                                    case "Overshoes":
                                        if (avg_temp < 20) {
                                            shoesRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        }
                                        break;
                                    case "Cap":
                                        if (avg_temp < 20) {
                                            capRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        }
                                        break;
                                    default:
                                        otherRes.push(`<ul class="search-results"><li class="piece-name">${item.name}</li><li class="piece-min-temp">${item.mintemp}&deg</li><li class="piece-max-temp">${item.maxtemp}&deg</li></ul>`);
                                        break;
                                }
                            }
                        }
                        // A continuació comprovem, per a cada tipus de peça, si hem obtingut resultats.
                        // Si no hem obtingut cap resultat, afegim l'avís i a continuació afegim aquests resultats a la variable finalRes.
                        // A finalRes anem guardant tots els resultats obtinguts.
                        if (jerseyRes.length == 1) {
                            jerseyRes.push("<h2 class='missing-piece'>No matched jersey found</h2>");
                        }
                        for (let piece of jerseyRes) {
                            finalRes += piece;
                        }
                        if (bibRes.length == 1) {
                            bibRes.push("<h2 class='missing-piece'>No matched bib found</h2>");
                        }
                        for (let piece of bibRes) {
                            finalRes += piece;
                        }
                        if (layerRes.length == 1) {
                            layerRes.push("<h2 class='missing-piece'>No matched layer found</h2>");
                        }
                        for (let piece of layerRes) {
                            finalRes += piece;
                        }
                        if (glovesRes.length == 1) {
                            glovesRes.push("<h2 class='missing-piece'>No matched gloves found</h2>");
                        }
                        for (let piece of glovesRes) {
                            finalRes += piece;
                        }
                        if (socksRes.length == 1) {
                            socksRes.push("<h2 class='missing-piece'>No matched socks found</h2>");
                        }
                        for (let piece of socksRes) {
                            finalRes += piece;
                        }
                        // En el cas de les categories Neck, Overshores i Cap, diferenciem si és necessari mostrar cap resultat segons
                        // si la temperatura és superior o no a 20 graus.
                        if (avg_temp < 20) {
                            if (neckRes.length == 1) {
                                neckRes.push("<h2 class='missing-piece'>No matched neck protection found</h2>");
                            }
                            if (shoesRes.length == 1) {
                                shoesRes.push("<h2 class='missing-piece'>No matched overshoes found</h2>");
                            }
                            if (capRes.length == 1) {
                                capRes.push("<h2 class='missing-piece'>No matched cap found</h2>");
                            }
                        } else {
                            neckRes.push("<h2 class='no-necessary-piece'>The neck protection is not necessary</h2>");
                            shoesRes.push("<h2 class='no-necessary-piece'>The overshoes are not necessary</h2>");
                            capRes.push("<h2 class='no-necessary-piece'>The cap is not necessary</h2>");
                        }
                        for (let piece of neckRes) {
                            finalRes += piece;
                        }
                        for (let piece of shoesRes) {
                            finalRes += piece;
                        }
                        for (let piece of capRes) {
                            finalRes += piece;
                        }
                        if (otherRes.length == 1) {
                            otherRes.push("<h2 class='no-necessary-piece'>No matched pieces found</h2>");
                        }
                        for (let piece of otherRes) {
                            finalRes += piece;
                        }
                        // Insertem els resultats a "content" i, per si de cas, fem scroll per assegurar que tornem a estar a dalt de tot de la pàgina.
                        finalRes += '<a href="index.html" id="new-search" target="_self"><button type="button" class="button">New Search</button></a>';
                        content.innerHTML = finalRes;
                        window.scrollTo(0, 0);
                    }
                });
                loading(false);
            }
        }
    }
};
outfit_button.addEventListener("click", getOutfitInfo);
/*
    ----------
*/




/*
    CÀRREGA DE LA PÀGINA ABOUT US
*/
const about_button = document.getElementById("about-button");
function insertAboutPage() {
    // En aquest cas utilitzarem la funció load() de la llibreria de jQuery, ja que ens facilita molt la feina en aquest cas:
    $("#content").load('aboutus.html');
}
about_button.addEventListener("click", insertAboutPage);
/*
    ----------
*/
