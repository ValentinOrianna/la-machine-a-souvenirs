async function afficherElementsEnAttente() {


    const photos =
        await recupererOffline(
            STORES.PHOTOS
        );


    const likes =
        await recupererOffline(
            STORES.LIKES
        );


    const messages =
        await recupererOffline(
            STORES.MESSAGES
        );



    const total =
        photos.length +
        likes.length +
        messages.length;



    const zone =
        document.getElementById(
            "offlineStatus"
        );



    if (!zone) {
        return;
    }



    if (total === 0) {


        zone.innerHTML =
            "🟢 Aucun souvenir en attente";


        return;

    }



    zone.innerHTML = `

        🔴 Hors connexion<br>

        ⚙️ Souvenirs en attente<br><br>

        📸 ${photos.length} photo(s)<br>

        ❤️ ${likes.length} like(s)<br>

        📖 ${messages.length} message(s)

    `;


}