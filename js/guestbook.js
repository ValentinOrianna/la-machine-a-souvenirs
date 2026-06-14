async function chargerLivreOr() {

    const container = document.getElementById("guestbookMessages");

    container.innerHTML = "";
    console.log(entree);

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

       const date = new Date(entree.created_at);

bloc.innerHTML = `
    <strong>${entree.prenom}</strong><br>

    <small>
        ${date.toLocaleDateString("fr-FR")}
        à
        ${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        })}
    </small>

    <br><br>

    ${entree.message}

    <hr>
`;

        container.appendChild(bloc);

    });
const messageCount = document.getElementById("messageCount");

if (messageCount) {
    messageCount.textContent =
        `📖 ${data.length} messages dans le livre d'or`;
}
}