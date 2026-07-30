console.log("✅ networkStatus.js chargé");


function afficherEtatReseau() {

    const zone = document.getElementById(
        "networkStatus"
    );


    if (!zone) {
        return;
    }


    if (navigator.onLine) {

        zone.innerHTML =
            "🟢 Connecté";

    } else {

        zone.innerHTML =
            "🔴 Déconnecté";

    }

}



window.addEventListener(
    "online",
    () => {

        afficherEtatReseau();

    }
);



window.addEventListener(
    "offline",
    () => {

        afficherEtatReseau();

    }
);