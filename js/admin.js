console.log("⚙️ Administration chargée");


const loginButton =
    document.getElementById("loginButton");


const loginMessage =
    document.getElementById("loginMessage");


const loginBox =
    document.getElementById("loginBox");


const adminPanel =
    document.getElementById("adminPanel");



loginButton.addEventListener(
    "click",
    async () => {


        const email =
            document.getElementById("adminEmail")
            .value
            .trim();


        const password =
            document.getElementById("adminPassword")
            .value;



        loginMessage.textContent =
            "Connexion...";



        const { data, error } =
            await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });



        if (error) {


            console.error(error);


            loginMessage.textContent =
                "❌ Identifiants incorrects";


            return;

        }



        const user =
    data.user;


console.log(
    "Utilisateur connecté :",
    user.email
);


const { data: admins, error: adminError } =
    await supabaseClient
    .from("admins")
    .select("*");


console.log(
    "ERREUR ADMINS :",
    adminError
);


console.log(
    "RESULTAT ADMINS :",
    admins
);


console.log(
    "Utilisateur Auth :",
    user.email
);


if (adminError || !admins || admins.length === 0) {

    console.error(adminError);

    await supabaseClient.auth.signOut();

    loginMessage.textContent =
        "❌ Accès administrateur refusé";

    return;

}


console.log(
    "✅ Administrateur connecté",
    admins
);


loginBox.style.display =
    "none";


adminPanel.style.display =
    "block";

await chargerStatsAdmin();

await chargerParticipantsAdmin();

    }
);

let listeParticipantsAdmin = [];


async function chargerParticipantsAdmin() {


    const zone =
        document.getElementById(
            "adminParticipantsList"
        );


    if (!zone) {
        return;
    }



    const { data, error } =
        await supabaseClient
        .from("participants")
        .select("*")
        .order(
            "prenom",
            {
                ascending:true
            }
        );



    if (error) {

        console.error(error);

        zone.textContent =
            "❌ Erreur chargement participants";

        return;

    }



 listeParticipantsAdmin =
    await chargerStatsParticipants(data);


afficherParticipantsAdmin(
    listeParticipantsAdmin
);



const recherche =
    document.getElementById(
        "participantSearch"
    );


if (recherche) {

    recherche.addEventListener(
        "input",
        () => {

            const texte =
                recherche.value
                .toLowerCase()
                .trim();


            const resultats =
                listeParticipantsAdmin.filter(
                    participant =>
                        participant.prenom
                        .toLowerCase()
                        .includes(texte)
                );


            afficherParticipantsAdmin(
                resultats
            );

        }
    );

}

}

async function chargerStatsParticipants(participants) {


    const resultat = [];


    for (const participant of participants) {


        const { count: photos } =
            await supabaseClient
            .from("photos")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "participant_id",
                participant.id
            );


        const { count: messages } =
            await supabaseClient
            .from("guestbook")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(
                "prenom",
                participant.prenom
            );


        resultat.push({

            ...participant,

            photos: photos || 0,

            messages: messages || 0

        });


    }


    return resultat;

;}

function afficherParticipantsAdmin(
    participants
) {


    const zone =
        document.getElementById(
            "adminParticipantsList"
        );


    zone.innerHTML = "";



    if (!participants.length) {


        zone.textContent =
            "Aucun participant";


        return;

    }



    participants.forEach(
        participant => {


            const carte =
                document.createElement(
                    "div"
                );


            carte.className =
                "participantCard";



           carte.innerHTML = `

👤 <strong>
${participant.prenom}
</strong>

<br>

📸 Photos :
${participant.photos}

<br>

📖 Messages :
${participant.messages}

<br>

<button
onclick="voirPhotosParticipant('${participant.id}')">

📸 Voir

</button>


<div id="photos-${participant.id}"></div>


<button 
onclick="voirMessagesParticipant('${participant.prenom}')">

📖 Voir

</button>

<br>

`;



            zone.appendChild(
                carte
            );


        }
    );


}

async function chargerStatsAdmin() {


    const zone =
        document.getElementById(
            "adminStatsContent"
        );


    if (!zone) {
        return;
    }



    const { count: participants } =
        await supabaseClient
        .from("participants")
        .select("*", {
            count: "exact",
            head: true
        });



    const { count: photos } =
        await supabaseClient
        .from("photos")
        .select("*", {
            count: "exact",
            head: true
        });



    const { count: messages } =
        await supabaseClient
        .from("guestbook")
        .select("*", {
            count: "exact",
            head: true
        });



    const { count: likes } =
        await supabaseClient
        .from("likes")
        .select("*", {
            count: "exact",
            head: true
        });



    zone.innerHTML = `

        <br><br>

        👥 Participants :
        ${participants || 0}

        <br><br>

        📸 Photos :
        ${photos || 0}

        <br><br>

        📖 Messages :
        ${messages || 0}

        <br><br>

        ❤️ Likes :
        ${likes || 0}

    `;


}
  async function voirPhotosParticipant(id) {


    const zone =
        document.getElementById(
            `photos-${id}`
        );


    if (!zone) {
        return;
    }


    // fermeture si déjà ouverte
    if (zone.innerHTML !== "") {

        zone.innerHTML = "";

        return;

    }



    const { data, error } =
        await supabaseClient
        .from("photos")
        .select("*")
        .eq(
            "participant_id",
            id
        );



    if (error) {

        console.error(error);

        return;

    }



    zone.innerHTML = `

    <h3>
    📸 Photos du participant
    </h3>


    <div class="adminPhotoGrid">

    </div>

    `;



    const grille =
        zone.querySelector(
            ".adminPhotoGrid"
        );



  data.forEach(photo => {


    grille.innerHTML += `

    <div class="adminPhotoCard">


        <img
        src="${photo.image_url}">


        <button
        class="deletePhotoButton"
        onclick="supprimerPhotoAdmin('${photo.id}', '${id}')">

        🗑️

        </button>


    </div>

    `;


});


}
async function supprimerPhotoAdmin(
    photoId,
    participantId
) {


    const confirmation =
        confirm(
            "Supprimer cette photo ?"
        );


    if (!confirmation) {
        return;
    }



    // récupérer la photo

    const { data: photo, error: rechercheErreur } =
        await supabaseClient
        .from("photos")
        .select("image_url")
        .eq(
            "id",
            photoId
        )
        .single();



    if (rechercheErreur) {

        console.error(rechercheErreur);

        return;

    }



    console.log(
        "Photo trouvée :",
        photo.image_url
    );



    // récupérer le chemin Storage

const chemin =
    decodeURIComponent(
        photo.image_url
    )
    .split(
        "/photo mariage/"
    )[1];



    console.log(
        "Chemin Storage :",
        chemin
    );



// suppression fichier Storage

const { error: storageError } =
    await supabaseClient
    .storage
    .from(
        "photo mariage"
    )
    .remove([
        chemin
    ]);


console.log(
    "Résultat suppression Storage :",
    storageError
);


// supprimer table photos

const { error: deleteError } =
    await supabaseClient
    .from("photos")
    .delete()
    .eq(
        "id",
        photoId
    );


console.log(
    "Résultat suppression table photos :",
    deleteError
);


if (deleteError) {

    console.error(
        "Erreur suppression base :",
        deleteError
    );

    return;

}


    if (storageError) {

        console.error(
            "Erreur Storage :",
            storageError
        );

        return;

    }

// rafraîchir affichage admin

const zone =
    document.getElementById(
        `photos-${participantId}`
    );


if (zone) {

    zone.innerHTML = "";

}


await chargerStatsAdmin();

await chargerParticipantsAdmin();


}