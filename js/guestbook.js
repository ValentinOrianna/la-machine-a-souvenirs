async function chargerLivreOr() {

    const container = document.getElementById("guestbookMessages");

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

        bloc.innerHTML = `
            <strong>${entree.prenom}</strong><br>
            ${entree.message}
            <hr>
        `;

        container.appendChild(bloc);

    });

}