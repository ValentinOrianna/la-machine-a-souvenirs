let defis = [];
let dernierDefiId = null;

async function chargerDefis() {
    const response = await fetch("data/defis.json");

    if (!response.ok) {
        throw new Error("Impossible de charger les défis.");
    }

    defis = await response.json();
    return defis;
}

function obtenirDefiAleatoire() {
    if (!defis.length) {
        return null;
    }

    if (defis.length === 1) {
        return defis[0];
    }

    let defi;

    do {
        const index = Math.floor(Math.random() * defis.length);
        defi = defis[index];
    } while (defi.id === dernierDefiId);

    dernierDefiId = defi.id;

    return defi;
}