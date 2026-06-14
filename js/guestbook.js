async function chargerLivreOr() {

    const container = document.getElementById("guestbookMessages");

    if (!container) {
        console.warn("guestbookMessages introuvable");
        return;
    }

    container.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    data.forEach(entree => {

        const bloc = document.createElement("div");

        const nom = document.createElement("strong");
        nom.textContent = entree.prenom || "Invité";

        const date = new Date(entree.created_at);

        const small = document.createElement("small");
        small.textContent =
            `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit"
            })}`;

        const message = document.createElement("p");
        message.textContent = entree.message;

        bloc.appendChild(nom);
        bloc.appendChild(document.createElement("br"));
        bloc.appendChild(small);
        bloc.appendChild(document.createElement("br"));
        bloc.appendChild(document.createElement("br"));
        bloc.appendChild(message);

        container.appendChild(bloc);
    });

    const messageCount = document.getElementById("messageCount");

    if (messageCount) {
        messageCount.textContent =
            `📖 ${data.length} messages dans le livre d'or`;
    }
}