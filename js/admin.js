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


await chargerParticipantsAdmin();

    }
);

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
                ascending: true
            }
        );


    if (error) {

        console.error(error);

        zone.textContent =
            "❌ Erreur chargement participants";

        return;

    }


    zone.innerHTML = "";


    if (!data.length) {

        zone.textContent =
            "Aucun participant";

        return;

    }



    data.forEach(participant => {


        const ligne =
            document.createElement("div");


        ligne.textContent =
            `👤 ${participant.prenom}`;


        zone.appendChild(ligne);


    });



    console.log(
        "✅ Participants chargés",
        data
    );


}