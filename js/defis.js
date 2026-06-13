let defis = [];

async function chargerDefis() {
    const response = await fetch("data/defis.json");
    defis = await response.json();
}

function obtenirDefiAleatoire() {

    if (defis.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * defis.length);

    return defis[index];
}