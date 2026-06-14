let defis = [];
let dernierDefiId = null;
let derniereCategorie = null;

async function chargerDefis() {
    const response = await fetch("data/defis.json");

    if (!response.ok) {
        throw new Error("Impossible de charger les défis.");
    }

    defis = await response.json();
}

function obtenirDefiAleatoire() {
    if (!defis.length) {
        return null;
    }

    let defisPossibles = defis.filter(defi =>
        defi.id !== dernierDefiId &&
        defi.categorie !== derniereCategorie
    );

    if (!defisPossibles.length) {
        defisPossibles = defis.filter(defi =>
            defi.id !== dernierDefiId
        );
    }

    if (!defisPossibles.length) {
        defisPossibles = defis;
    }

    const index = Math.floor(Math.random() * defisPossibles.length);
    const defi = defisPossibles[index];

    dernierDefiId = defi.id;
    derniereCategorie = defi.categorie;

    return defi;
}

function afficherDefi(defi) {
    const categorie = document.getElementById("challengeCategory");
    const texte = document.getElementById("challengeText");

    if (categorie) {
        categorie.textContent = defi.categorie;
    }

    if (texte) {
        texte.textContent = defi.texte;
    }
}

async function initialiserDefis() {
    try {
        await chargerDefis();

        const bouton = document.getElementById("discoverButton");

        if (!bouton) {
            return;
        }

        bouton.addEventListener("click", () => {
            const defi = obtenirDefiAleatoire();

            if (defi) {
                afficherDefi(defi);
            }
        });

    } catch (error) {
        console.error(error);

        const texte = document.getElementById("challengeText");

        if (texte) {
            texte.textContent = "Impossible de charger les défis.";
        }
    }
}

initialiserDefis();