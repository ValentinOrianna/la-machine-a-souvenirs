async function chargerClassement() {

    const rankingList = document.getElementById("rankingList");

    if (!rankingList) {
        console.warn("rankingList introuvable");
        return;
    }

    rankingList.innerHTML = "";

    const { data: participants, error } = await supabaseClient
        .from("participants")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    const participantCount = document.getElementById("participantCount");

    if (participantCount) {
        participantCount.textContent =
            `🏆 ${participants.length} participant(s)`;
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

        const badge = obtenirBadge(joueur.photos);

        ligne.innerHTML = `
            ${medal}
            <strong>${joueur.prenom}</strong>
            — ${joueur.photos} photo(s)
            <br>
            <small>${badge}</small>
        `;

        rankingList.appendChild(ligne);
    });
}

function obtenirBadge(nombrePhotos) {

    if (nombrePhotos >= 50) {
        return "👑 Légende du mariage";
    }

    if (nombrePhotos >= 25) {
        return "🥇 Maître des souvenirs";
    }

    if (nombrePhotos >= 10) {
        return "🥈 Aventurier";
    }

    if (nombrePhotos >= 5) {
        return "🥉 Explorateur";
    }

    return "⚙️ Débutant";
}