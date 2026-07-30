let envoiEnCours = false;
async function compresserImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event) => {
            img.src = event.target.result;
        };

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    const fichierCompresse = new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, ".jpg"),
                        { type: "image/jpeg" }
                    );

                    resolve(fichierCompresse);
                },
                "image/jpeg",
                quality
            );
        };

        reader.onerror = () => resolve(file);
        img.onerror = () => resolve(file);

        reader.readAsDataURL(file);
    });
}
document.addEventListener("DOMContentLoaded", async () => {

     await chargerDefis();
    await chargerTopPhotos();
    await chargerGalerie();
    await chargerClassement();
    await chargerLivreOr();

    await afficherElementsEnAttente();

    afficherEtatReseau();

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
    const playerNameInput = document.getElementById("playerName");
    const savedPlayerName = localStorage.getItem("playerName");
    const uploadButtonText = uploadButton.querySelector("span");

if (savedPlayerName) {
    playerNameInput.value = savedPlayerName;
}

playerNameInput.addEventListener("input", () => {
    localStorage.setItem("playerName", playerNameInput.value.trim());
});

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
        previewImage.hidden = true;
        removePhotoButton.style.display = "none";
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    previewImage.src = imageUrl;
    previewImage.hidden = false;

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
        previewImage.hidden = true;
        removePhotoButton.style.display = "none";
    });

    uploadButton.addEventListener("click", async () => {

    if (envoiEnCours) {
    return;
}

envoiEnCours = true;
uploadButton.disabled = true;
uploadButton.style.pointerEvents = "none";

if (uploadButtonText) {
    uploadButtonText.textContent = "Préparation...";
}
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

      if (uploadButtonText) {
    uploadButtonText.textContent = "Compression de la photo...";
}

const fichierFinal = await compresserImage(file);

const nomFichier = `souvenirs/photo-${Date.now()}.jpg`;

// Vérification connexion
if (!navigator.onLine) {

    const photoEnAttente = {

        id: genererIdOffline("photo"),
        name: nomFichier,
        file: fichierFinal,
        prenom: playerName,
        signature: creerSignaturePhoto(file),
        date: new Date().toISOString(),
        status: "pending"

    };


    await ajouterOffline(
        STORES.PHOTOS,
        photoEnAttente
    );


    console.log(
        "📸 Photo sauvegardée hors ligne",
        photoEnAttente
    );


    if (uploadButtonText) {
        uploadButtonText.textContent =
            "Photo en attente de connexion ⚙️";
    }


    alert(
        "⚙️ La Machine a gardé votre souvenir.\n\nLa photo sera envoyée automatiquement dès que la connexion reviendra."
    );


    cameraInput.value = "";
    galleryInput.value = "";

    previewImage.src = "";
    previewImage.removeAttribute("src");

    removePhotoButton.style.display = "none";

    previewImage.hidden = true;


    return;
}

if (uploadButtonText) {
    uploadButtonText.textContent = "Envoi de la photo...";
}

const { error: uploadError } = await supabaseClient.storage
    .from("photo mariage")
    .upload(nomFichier, fichierFinal, {
        contentType: "image/jpeg"
    });

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
await chargerTopPhotos();
await chargerClassement();

cameraInput.value = "";
galleryInput.value = "";

previewImage.src = "";
previewImage.removeAttribute("src");
removePhotoButton.style.display = "none";
previewImage.hidden = true;


} finally {

    console.log("🔓 FIN ENVOI PHOTO");

    envoiEnCours = false;

    if (uploadButton) {
        uploadButton.disabled = false;
        uploadButton.style.pointerEvents = "auto";
    }

    if (uploadButtonText) {
        uploadButtonText.textContent =
        "Envoyer à la Machine à Souvenirs";
    }

}

});
     let messageEnCours = false;

guestbookButton.addEventListener("click", async () => {

    if (messageEnCours) {
        return;
    }

    messageEnCours = true;
    guestbookButton.disabled = true;
    guestbookButton.textContent = "Publication...";

    try {
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

       if (!navigator.onLine) {


    const messageEnAttente = {

        id: genererIdOffline("message"),

        prenom: playerName,

        message: message,

        date: new Date().toISOString(),

        status: "pending"

    };


    await ajouterOffline(
        STORES.MESSAGES,
        messageEnAttente
    );


    console.log(
        "📖 Message sauvegardé hors ligne",
        messageEnAttente
    );


    guestbookMessage.value = "";


    guestbookButton.textContent =
        "⚙️ Message en attente de connexion";


    setTimeout(() => {

        guestbookButton.textContent =
            "Publier";

    }, 3000);


    return;

}



// MODE EN LIGNE

const { error } = await supabaseClient
    .from("guestbook")
    .insert({
        prenom: playerName,
        message: message
    });


if (error) {

    console.error(error);

    alert(
        "Erreur lors de la publication du message."
    );

    return;

}

        guestbookMessage.value = "";

        await chargerLivreOr();

        guestbookButton.textContent = "✅ Message publié !";

        setTimeout(() => {
            guestbookButton.textContent = "Publier";
        }, 2000);

    } finally {
        messageEnCours = false;
        guestbookButton.disabled = false;
    }
    });

});