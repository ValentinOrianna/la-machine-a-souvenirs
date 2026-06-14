let envoiEnCours = false;
document.addEventListener("DOMContentLoaded", async () => {

    await chargerDefis();
    await chargerTopPhotos();
    await chargerGalerie();
    await chargerClassement();
    await chargerLivreOr();

    const button = document.getElementById("discoverButton");
    const challengeText = document.getElementById("challengeText");
    const challengeCategory = document.getElementById("challengeCategory");
    
    const cameraButton = document.getElementById("cameraButton");
    const galleryButton = document.getElementById("galleryButton");
    const cameraInput = document.getElementById("cameraInput");
    const galleryInput = document.getElementById("galleryInput");

    const previewImage = document.getElementById("previewImage");
    const removePhotoButton = document.getElementById("removePhotoButton");
    const uploadButton = document.getElementById("uploadButton");
    const playerNameInput = document.getElementById("playerName");const savedPlayerName = localStorage.getItem("playerName");

if (savedPlayerName) {
    playerNameInput.value = savedPlayerName;
}

playerNameInput.addEventListener("input", () => {
    localStorage.setItem("playerName", playerNameInput.value.trim());
});
    const savedPlayerName = localStorage.getItem("playerName");

if (savedPlayerName) {
    playerNameInput.value = savedPlayerName;
}

    const guestbookMessage = document.getElementById("guestbookMessage");
    const guestbookButton = document.getElementById("guestbookButton");

    cameraButton.addEventListener("click", () => {
        cameraInput.click();
    });

    galleryButton.addEventListener("click", () => {
        galleryInput.click();
    });

    button.addEventListener("click", () => {
        const defi = obtenirDefiAleatoire();

        if (!defi) {
            challengeText.textContent = "Aucun défi disponible.";
            return;
        }
        challengeCategory.textContent = defi.categorie;
        challengeText.textContent = defi.texte;
    });

    function afficherPreview(file) {
        if (!file) {
            previewImage.src = "";
            previewImage.removeAttribute("src");
            removePhotoButton.style.display = "none";
            return;
        }

        const imageUrl = URL.createObjectURL(file);

        previewImage.src = imageUrl;
        removePhotoButton.style.display = "inline-block";
    }

    cameraInput.addEventListener("change", () => {
        afficherPreview(cameraInput.files[0]);
    });

    galleryInput.addEventListener("change", () => {
        afficherPreview(galleryInput.files[0]);
    });

    removePhotoButton.addEventListener("click", () => {
        cameraInput.value = "";
        galleryInput.value = "";

        previewImage.src = "";
        previewImage.removeAttribute("src");
        removePhotoButton.style.display = "none";
    });

    uploadButton.addEventListener("click", async () => {

    if (envoiEnCours) {
    return;
}

envoiEnCours = true;
uploadButton.disabled = true;
uploadButton.style.pointerEvents = "none";
uploadButton.textContent = "Envoi en cours...";
    

    uploadButton.disabled = true;
    uploadButton.textContent = "Envoi en cours...";

    try {
        const file = cameraInput.files[0] || galleryInput.files[0];
        const playerName = playerNameInput.value.trim();
        localStorage.setItem("playerName", playerName);

        if (!playerName) {
            alert("Veuillez entrer votre prénom.");
            return;
        }

        if (!file) {
            alert("Veuillez sélectionner une photo.");
            return;
        }

        const extension = file.name.split(".").pop();
        const nomFichier = `souvenirs/photo-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("photo mariage")
            .upload(nomFichier, file);

        if (uploadError) {
            console.error(uploadError);
            alert("Erreur lors de l'envoi de la photo.");
            return;
        }

        const { data: urlData } = supabaseClient.storage
            .from("photo mariage")
            .getPublicUrl(nomFichier);

        let participantId;

        const { data: existingParticipant, error: searchError } = await supabaseClient
            .from("participants")
            .select("*")
            .eq("prenom", playerName)
            .maybeSingle();

        if (searchError) {
            console.error(searchError);
            alert("Erreur lors de la recherche du participant.");
            return;
        }

        if (existingParticipant) {
            participantId = existingParticipant.id;
        } else {
            const { data: newParticipant, error: participantError } = await supabaseClient
                .from("participants")
                .insert({
                    prenom: playerName
                })
                .select()
                .single();

            if (participantError) {
                console.error(participantError);
                alert("Erreur lors de l'enregistrement du participant.");
                return;
            }

            participantId = newParticipant.id;
        }

        const { error: photoError } = await supabaseClient
            .from("photos")
            .insert({
                participant_id: participantId,
                image_url: urlData.publicUrl
            });

        if (photoError) {
            console.error(photoError);
            alert("Erreur lors de l'enregistrement de la photo.");
            return;
        }

       await chargerGalerie();
await chargerClassement();

cameraInput.value = "";
galleryInput.value = "";

previewImage.src = "";
previewImage.removeAttribute("src");
removePhotoButton.style.display = "none";


    } finally {
    envoiEnCours = false;
    uploadButton.disabled = false;
    uploadButton.style.pointerEvents = "auto";
    uploadButton.textContent = "Envoyer à la Machine à Souvenirs";

        
    }

});

    guestbookButton.addEventListener("click", async () => {
        const playerName = playerNameInput.value.trim();
        localStorage.setItem("playerName", playerName);
        const message = guestbookMessage.value.trim();

        if (!playerName) {
            alert("Veuillez entrer votre prénom.");
            return;
        }

        if (!message) {
            alert("Veuillez écrire un message.");
            return;
        }

        const { error } = await supabaseClient
            .from("guestbook")
            .insert({
                prenom: playerName,
                message: message
            });

        if (error) {
            console.error(error);
            alert("Erreur lors de la publication du message.");
            return;
        }

        guestbookMessage.value = "";

        await chargerLivreOr();

        alert("Message publié dans le livre d'or !");
    });

});