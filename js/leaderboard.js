async function chargerClassement() {

    const rankingList = document.getElementById("rankingList");

    rankingList.innerHTML = "";

    const { data: participants, error } = await supabaseClient
        .from("participants")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    const classement = [];

    for (const participant of participants) {

        const { count } = await supabaseClient
            .from("photos")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("participant_id", participant.id);

        classement.push({
            prenom: participant.prenom,
            photos: count || 0
        });
    }

    classement.sort((a, b) => b.photos - a.photos);

    classement.forEach((joueur, index) => {

        const ligne = document.createElement("div");

        let medal = "";

        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";

        ligne.innerHTML = `
            ${medal}
            <strong>${joueur.prenom}</strong>
            — ${joueur.photos} photo(s)
        `;

        rankingList.appendChild(ligne);

    });

}