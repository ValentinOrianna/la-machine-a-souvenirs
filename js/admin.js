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

    <br><br>
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