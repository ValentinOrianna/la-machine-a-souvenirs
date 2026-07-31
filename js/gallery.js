let toutesLesPhotos = [];
let photosAffichees = 0;
const NOMBRE_PAR_PAGE = 30;

async function chargerGalerie() {

   const galleryGrid = document.getElementById("galleryGrid");

if (!galleryGrid) {
    console.warn("galleryGrid introuvable");
    return;
}
    galleryGrid.innerHTML = "";

    photosAffichees = 0;

  const { data, error } =
    await supabaseClient
    .from("photos")
    .select("*")
    .order(
        "created_at",
        {
            ascending:false
        }
    );

    if (error) {
        console.error("Erreur galerie :", error);
        return;
    }
    console.log(
    "Fichiers Storage trouvés :",
    data
);

    toutesLesPhotos = data || [];

    const photoCount = document.getElementById("photoCount");

    if (photoCount) {
        photoCount.textContent =
            `📸 ${toutesLesPhotos.length} souvenirs capturés`;
    }

    afficherPhotosSuivantes();
}

async function afficherPhotosSuivantes() {

    const galleryGrid = document.getElementById("galleryGrid");

    const photosAShow = toutesLesPhotos.slice(
        photosAffichees,
        photosAffichees + NOMBRE_PAR_PAGE
    );

    for (const photo of photosAShow) {

 const carte = document.createElement("div");

carte.className = "photoCard";


const img = document.createElement("img");


img.src = photo.image_url;

img.loading = "lazy";

img.decoding = "async";

img.alt = "Photo souvenir";


img.className = "galleryPhoto";


img.addEventListener("click", () => {

    ouvrirPhoto(
        photo.image_url
    );

});

        const likeButton = document.createElement("button");
        likeButton.className = "likeButton";

       const dejaLike =
    localStorage.getItem(
        `like-${photo.id}`
    );


const nombreLikes =
    await compterLikes(
        photo.id
    );

        likeButton.textContent = dejaLike
            ? `❤️ ${nombreLikes}`
            : `🤍 ${nombreLikes}`;

        likeButton.disabled = !!dejaLike;
        await chargerTopPhotos();

     likeButton.addEventListener("click", async () => {


    if (localStorage.getItem(`like-${photo.id}`)) {

    return;

}



   const likeData = {

    id: genererIdOffline("like"),

    photo_name: photo.id,

    date: new Date().toISOString(),

    status: "pending"

};




    // MODE HORS LIGNE

    if (!navigator.onLine) {


        await ajouterOffline(
            STORES.LIKES,
            likeData
        );
        
await afficherElementsEnAttente();

        localStorage.setItem(
            `like-${photo.id}`,
            "true"
        );


        const nouveauTotal = await compterLikes(photo.id);


        likeButton.textContent =
            `❤️ ${nouveauTotal + 1}`;


        likeButton.disabled = true;



        console.log(
            "❤️ Like sauvegardé hors ligne",
            likeData
        );


        return;

    }




    // MODE EN LIGNE

    const { error } = await supabaseClient
        .from("likes")
        .insert({

            photo_name: photo.id

        });



    if (error) {


        console.error(error);

        alert(
            "Erreur lors du like."
        );

        return;

    }



    localStorage.setItem(
        `like-${photo.id}`,
        "true"
    );


    const nouveauTotal =
        await compterLikes(photo.id);


    likeButton.textContent =
        `❤️ ${nouveauTotal}`;


    likeButton.disabled = true;


});

        carte.appendChild(img);
        carte.appendChild(likeButton);

        galleryGrid.appendChild(carte);
    }

    photosAffichees += photosAShow.length;

    gererBoutonVoirPlus();
}

async function compterLikes(photoName) {


    let total = 0;



    // Likes déjà présents dans Supabase

    if (navigator.onLine) {


        const { count, error } = await supabaseClient
            .from("likes")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("photo_name", photoName);



        if (!error) {

            total = count || 0;

        } else {

            console.error(error);

        }


    }



    // Likes en attente dans IndexedDB

    try {


        const likesOffline = await recupererOffline(
            STORES.LIKES
        );


        const likesEnAttente = likesOffline.filter(
            like =>
                like.photo_name === photoName
        );


        total += likesEnAttente.length;



    } catch(error) {


        console.error(
            "Erreur lecture likes offline",
            error
        );


    }



    return total;

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

}async function chargerTopPhotos() {

    const container = document.getElementById("topPhotos");

    if (!container) return;

    container.innerHTML = "";

    const { data: likes, error } = await supabaseClient
        .from("likes")
        .select("*");

const { data: photosExistantes } =
    await supabaseClient
    .from("photos")
    .select("id");


const idsPhotos =
    photosExistantes.map(
        photo => photo.id
    );


const likesValides =
    likes.filter(
        like =>
            idsPhotos.includes(
                like.photo_name
            )
    );

    if (error) {
        console.error(error);
        return;
        
    }

    const compteLikes = {};

    likesValides.forEach(like => {

        if (!compteLikes[like.photo_name]) {
            compteLikes[like.photo_name] = 0;
        }

        compteLikes[like.photo_name]++;
    });

    const top3 = Object.entries(compteLikes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    for (let i = 0; i < top3.length; i++) {

        const [photoName, nbLikes] = top3[i];

       const { data: photoData } =
    await supabaseClient
    .from("photos")
    .select("image_url")
    .eq(
        "id",
        photoName
    )
    .single();


if (!photoData) {
    continue;
}
        let medal = "🏅";

        if (i === 0) medal = "🥇";
        if (i === 1) medal = "🥈";
        if (i === 2) medal = "🥉";

        const card = document.createElement("div");

        card.className = "topPhotoCard";

        card.innerHTML = `
            <img src="${urlData.publicUrl}">
            <p>${medal} ❤️ ${nbLikes}</p>
        `;

        container.appendChild(card);
    }
}