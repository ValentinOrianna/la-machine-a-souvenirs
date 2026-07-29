async function synchroniserSouvenirs() {

    if (!navigator.onLine) {
        console.log("⚙️ Pas de connexion, synchronisation impossible");
        return;
    }


    console.log("⚙️ Début synchronisation...");


    const photos = await recupererOffline(STORES.PHOTOS);


    for (const photo of photos) {

        try {

            const { error } = await supabaseClient
                .storage
                .from("photo mariage")
                .upload(
                    `souvenirs/${photo.name}`,
                    photo.file
                );


            if (!error) {

                await supprimerOffline(
                    STORES.PHOTOS,
                    photo.id
                );

                console.log(
                    "📸 Photo synchronisée",
                    photo.name
                );

            }


        } catch(error) {

            console.error(
                "Erreur synchronisation photo",
                error
            );

        }

    }


    console.log("⚙️ Synchronisation terminée");

}




window.addEventListener(
    "online",
    () => {

        synchroniserSouvenirs();

    }
);