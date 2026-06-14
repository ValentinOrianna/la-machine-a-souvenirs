let toutesLesPhotos = [];
let photosAffichees = 0;
const NOMBRE_PAR_PAGE = 10;

async function chargerGalerie() {

    const galleryGrid = document.getElementById("galleryGrid");
    galleryGrid.innerHTML = "";

    photosAffichees = 0;

    const { data, error } = await supabaseClient.storage
        .from("photo mariage")
        .list("souvenirs", {
            limit: 1000,
            sortBy: {
                column: "created_at",
                order: "desc"
            }
        });

    if (error) {
        console.error("Erreur galerie :", error);
        return;
    }

    toutesLesPhotos = data || [];

    const photoCount = document.getElementById("photoCount");

    if (photoCount) {
        photoCount.textContent =
            `📸 ${toutesLesPhotos.length} souvenirs capturés`;
    }

    afficherPhotosSuivantes();
}

function afficherPhotosSuivantes() {

    const galleryGrid = document.getElementById("galleryGrid");

    const photosAShow = toutesLesPhotos.slice(
        photosAffichees,
        photosAffichees + NOMBRE_PAR_PAGE
    );

    for (const photo of photosAShow) {

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

    photosAffichees += photosAShow.length;

    gererBoutonVoirPlus();
}

function gererBoutonVoirPlus() {

    let bouton = document.getElementById("voirPlusPhotos");

    if (bouton) {
        bouton.remove();
    }

    if (photosAffichees >= toutesLesPhotos.length) {
        return;
    }

    bouton = document.createElement("button");
    bouton.id = "voirPlusPhotos";
    bouton.textContent = "📸 Voir plus de photos";

    bouton.addEventListener("click", () => {
        afficherPhotosSuivantes();
    });

    const gallerySection = document.getElementById("gallerySection");
    gallerySection.appendChild(bouton);
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