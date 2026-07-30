async function afficherElementsEnAttente() {


    const photos =
        await recupererOffline(STORES.PHOTOS);


    const likes =
        await recupererOffline(STORES.LIKES);


    const messages =
    await recupererOffline(STORES.MESSAGES);


console.log("OFFLINE PHOTOS", photos);
console.log("OFFLINE LIKES", likes);
console.log("OFFLINE MESSAGES", messages);


    const zone =
        document.getElementById("offlineStatus");


    if (!zone) {
        return;
    }



    zone.innerHTML = `

        ⚙️ Souvenirs en attente

        <br><br>

        📸 ${photos.length} photo(s)

        <br>

        ❤️ ${likes.length} like(s)

        <br>

        📖 ${messages.length} message(s)

    `;


}