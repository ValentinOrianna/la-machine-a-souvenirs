async function synchroniserPhotosHorsLigne() {

    if (!navigator.onLine) {

        console.log("⚙️ Pas de connexion, synchronisation impossible");

        return;

    }


    console.log("⚙️ Début synchronisation des souvenirs...");


    const photosEnAttente = await recupererOffline(
        STORES.PHOTOS
    );


    if (!photosEnAttente.length) {

        console.log("⚙️ Aucun souvenir en attente");

        return;

    }



    for (const photo of photosEnAttente) {


        try {


            console.log(
                "📸 Synchronisation de :",
                photo.name
            );



            // 1 - Envoi dans Supabase Storage

            const { error: uploadError } =
                await supabaseClient.storage
                .from("photo mariage")
                .upload(
                    photo.name,
                    photo.file,
                    {
                        contentType: "image/jpeg"
                    }
                );



            if (uploadError) {

                console.error(
                    "Erreur upload photo",
                    uploadError
                );

                continue;

            }




            // 2 - Récupération URL publique

            const { data: urlData } =
                supabaseClient.storage
                .from("photo mariage")
                .getPublicUrl(
                    photo.name
                );




            // 3 - Trouver ou créer participant

            let participantId;



            const { data: existingParticipant } =
                await supabaseClient
                .from("participants")
                .select("*")
                .eq(
                    "prenom",
                    photo.prenom
                )
                .maybeSingle();



            if (existingParticipant) {


                participantId =
                    existingParticipant.id;


            } else {


                const { data: newParticipant,
                    error: participantError
                } = await supabaseClient
                .from("participants")
                .insert({

                    prenom: photo.prenom

                })
                .select()
                .single();



                if (participantError) {

                    console.error(
                        participantError
                    );

                    continue;

                }


                participantId =
                    newParticipant.id;

            }




            // 4 - Enregistrer la photo dans la base

            const { error: photoError } =
                await supabaseClient
                .from("photos")
                .insert({

                    participant_id: participantId,

                    image_url:
                    urlData.publicUrl

                });



            if (photoError) {


                console.error(
                    "Erreur enregistrement photo",
                    photoError
                );


                continue;

            }




            // 5 - Supprimer de IndexedDB

            await supprimerOffline(

                STORES.PHOTOS,

                photo.id

            );



            console.log(
                "✅ Photo synchronisée :",
                photo.name
            );



        } catch(error) {


            console.error(
                "Erreur synchronisation",
                error
            );


        }


    }



    console.log(
        "⚙️ Synchronisation terminée"
    );


}




// Détection retour connexion

window.addEventListener(
    "online",
    () => {


        console.log(
            "🌐 Connexion retrouvée"
        );


        synchroniserPhotosHorsLigne();


    }
);




// Vérification au lancement

if (navigator.onLine) {


    synchroniserPhotosHorsLigne();


}