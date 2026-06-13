async function chargerGalerie() {

    const galleryGrid = document.getElementById("galleryGrid");

    galleryGrid.innerHTML = "";

    const { data, error } = await supabaseClient.storage
        .from("photo mariage")
        .list("souvenirs");

    if (error) {
        console.error("Erreur galerie :", error);
        return;
    }

    for (const photo of data) {

        const { data: urlData } = supabaseClient.storage
            .from("photo mariage")
            .getPublicUrl(`souvenirs/${photo.name}`);

        const img = document.createElement("img");

        img.src = urlData.publicUrl;
        img.alt = "Photo souvenir";

        img.style.width = "200px";
        img.style.borderRadius = "12px";
        img.style.margin = "10px";
        img.style.cursor = "pointer";

        img.addEventListener("click", () => {
            ouvrirPhoto(urlData.publicUrl);
        });

        galleryGrid.appendChild(img);
    }
}

function ouvrirPhoto(url) {

    const overlay = document.createElement("div");

    overlay.id = "photoOverlay";

    overlay.innerHTML = `
        <img src="${url}" alt="Photo agrandie">
    `;

    overlay.addEventListener("click", () => {
        overlay.remove();
    });

    document.body.appendChild(overlay);
}