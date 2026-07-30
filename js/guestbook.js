async function chargerLivreOr() {

    const container = document.getElementById("guestbookMessages");


    if (!container) {

        console.warn(
            "guestbookMessages introuvable"
        );

        return;

    }


    container.innerHTML = "";


    let messages = [];



    // Récupération Supabase si connecté

    if (navigator.onLine) {


        const { data, error } = await supabaseClient
            .from("guestbook")
            .select("*")
            .order("created_at", {
                ascending: false
            });



        if (error) {

            console.error(error);

        } else {

            messages = data || [];

        }

    }



    // Récupération messages en attente hors ligne

    try {


        const messagesOffline = await recupererOffline(
            STORES.MESSAGES
        );



        const messagesEnAttente =
            messagesOffline.map(message => ({

                prenom: message.prenom,

                message: message.message,

                created_at: message.date,

                offline: true

            }));



        messages = [
            ...messagesEnAttente,
            ...messages
        ];



    } catch(error) {


        console.error(
            "Erreur récupération messages offline",
            error
        );


    }



    // Affichage des messages

    messages.forEach(entree => {


        const bloc = document.createElement("div");


        const nom = document.createElement("strong");

        nom.textContent =
            entree.prenom || "Invité";



        const date = new Date(
            entree.created_at
        );



        const small = document.createElement("small");


        small.textContent =
            `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit"
            })}`;



        if (entree.offline) {

            small.textContent +=
                " ⚙️ En attente de connexion";

        }



        const message = document.createElement("p");

        message.textContent =
            entree.message;



        bloc.appendChild(nom);

        bloc.appendChild(
            document.createElement("br")
        );

        bloc.appendChild(small);

        bloc.appendChild(
            document.createElement("br")
        );

        bloc.appendChild(
            document.createElement("br")
        );

        bloc.appendChild(message);



        container.appendChild(bloc);


    });



    const messageCount =
        document.getElementById("messageCount");



    if (messageCount) {

        messageCount.textContent =
            `📖 ${messages.length} messages dans le livre d'or`;

    }


}