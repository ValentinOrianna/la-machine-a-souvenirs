let toutesLesPhotos = [];
let photosAffichees = 0;

const NOMBRE_PAR_PAGE = 30;

const BUCKET_PHOTOS = "photo mariage";
const DOSSIER_PHOTOS = "souvenirs";


/* =========================================================
   OUTILS STORAGE
========================================================= */

function estUneImage(photo) {

    if (!photo || !photo.name) {
        return false;
    }

    const type = photo.metadata?.mimetype || "";

    if (type.startsWith("image/")) {
        return true;
    }

    return /\.(jpg|jpeg|png|webp|gif)$/i.test(photo.name);
}


function obtenirUrlPhoto(nomFichier) {

    const chemin =
        `${DOSSIER_PHOTOS}/${nomFichier}`;

    const { data } =
        supabaseClient.storage
            .from(BUCKET_PHOTOS)
            .getPublicUrl(chemin);

    return data.publicUrl;
}


/* =========================================================
   GALERIE
========================================================= */

async function chargerGalerie() {

    const galleryGrid =
        document.getElementById("galleryGrid");

    if (!galleryGrid) {

        console.warn(
            "galleryGrid introuvable"
        );

        return;
    }


    galleryGrid.innerHTML = "";

    photosAffichees = 0;


    const { data, error } =
        await supabaseClient.storage
            .from(BUCKET_PHOTOS)
            .list(DOSSIER_PHOTOS, {

                limit: 1000,

                sortBy: {
                    column: "created_at",
                    order: "desc"
                }

            });


    if (error) {

        console.error(
            "Erreur galerie Storage :",
            error
        );

        return;
    }


    console.log(
        "Fichiers trouvés dans le Storage :",
        data
    );


    toutesLesPhotos =
        (data || [])
            .filter(estUneImage)
            .map(photo => {

                return {

                    ...photo,

                    storageName: photo.name,

                    storagePath:
                        `${DOSSIER_PHOTOS}/${photo.name}`,

                    image_url:
                        obtenirUrlPhoto(photo.name),

                    likeKey:
                        photo.name

                };

            });


    const photoCount =
        document.getElementById("photoCount");


    if (photoCount) {

        photoCount.textContent =
            `📸 ${toutesLesPhotos.length} souvenirs capturés`;

    }


    afficherPhotosSuivantes();
}


/* =========================================================
   AFFICHAGE DES PHOTOS
========================================================= */

async function afficherPhotosSuivantes() {

    const galleryGrid =
        document.getElementById("galleryGrid");


    if (!galleryGrid) {
        return;
    }


    const photosAShow =
        toutesLesPhotos.slice(

            photosAffichees,

            photosAffichees +
            NOMBRE_PAR_PAGE

        );


    for (const photo of photosAShow) {


        const carte =
            document.createElement("div");

        carte.className =
            "photoCard";


        /* PHOTO */

        const img =
            document.createElement("img");


        img.src =
            photo.image_url;


        img.loading =
            "lazy";


        img.decoding =
            "async";


        img.alt =
            "Photo souvenir";


        img.className =
            "galleryPhoto";


        img.addEventListener(
            "click",
            () => {

                ouvrirPhoto(
                    photo.image_url
                );

            }
        );


        /* LIKE */

        const likeButton =
            document.createElement("button");

        likeButton.className =
            "likeButton";


        const identifiantPhoto =
            photo.likeKey;


        const dejaLike =
            localStorage.getItem(
                `like-${identifiantPhoto}`
            );


        const nombreLikes =
            await compterLikes(
                identifiantPhoto
            );


        likeButton.textContent =
            dejaLike
                ? `❤️ ${nombreLikes}`
                : `🤍 ${nombreLikes}`;


        likeButton.disabled =
            !!dejaLike;


        likeButton.addEventListener(
            "click",
            async () => {


                if (
                    localStorage.getItem(
                        `like-${identifiantPhoto}`
                    )
                ) {

                    return;

                }


                const likeData = {

                    id:
                        genererIdOffline(
                            "like"
                        ),

                    photo_name:
                        identifiantPhoto,

                    date:
                        new Date()
                            .toISOString(),

                    status:
                        "pending"

                };


                /* =========================
                   MODE HORS LIGNE
                ========================= */

                if (!navigator.onLine) {


                    await ajouterOffline(
                        STORES.LIKES,
                        likeData
                    );


                    await afficherElementsEnAttente();


                    localStorage.setItem(
                        `like-${identifiantPhoto}`,
                        "true"
                    );


                    const nouveauTotal =
                        await compterLikes(
                            identifiantPhoto
                        );


                    likeButton.textContent =
                        `❤️ ${nouveauTotal}`;


                    likeButton.disabled =
                        true;


                    console.log(
                        "❤️ Like sauvegardé hors ligne",
                        likeData
                    );


                    return;
                }


                /* =========================
                   MODE EN LIGNE
                ========================= */

                const { error } =
                    await supabaseClient
                        .from("likes")
                        .insert({

                            photo_name:
                                identifiantPhoto

                        });


                if (error) {

                    console.error(error);

                    alert(
                        "Erreur lors du like."
                    );

                    return;
                }


                localStorage.setItem(
                    `like-${identifiantPhoto}`,
                    "true"
                );


                const nouveauTotal =
                    await compterLikes(
                        identifiantPhoto
                    );


                likeButton.textContent =
                    `❤️ ${nouveauTotal}`;


                likeButton.disabled =
                    true;


                await chargerTopPhotos();

            }
        );


        carte.appendChild(img);

        carte.appendChild(
            likeButton
        );


        galleryGrid.appendChild(
            carte
        );

    }


    photosAffichees +=
        photosAShow.length;


    gererBoutonVoirPlus();
}


/* =========================================================
   COMPTER LES LIKES
========================================================= */

async function compterLikes(photoName) {

    let total = 0;


    /* LIKES SUPABASE */

    if (navigator.onLine) {

        const { count, error } =
            await supabaseClient
                .from("likes")
                .select("*", {

                    count: "exact",
                    head: true

                })
                .eq(
                    "photo_name",
                    photoName
                );


        if (!error) {

            total =
                count || 0;

        } else {

            console.error(error);

        }

    }


    /* LIKES HORS LIGNE */

    try {

        const likesOffline =
            await recupererOffline(
                STORES.LIKES
            );


        const likesEnAttente =
            likesOffline.filter(
                like =>
                    like.photo_name ===
                    photoName
            );


        total +=
            likesEnAttente.length;

    }

    catch (error) {

        console.error(
            "Erreur lecture likes offline",
            error
        );

    }


    return total;
}


/* =========================================================
   BOUTON VOIR PLUS
========================================================= */

function gererBoutonVoirPlus() {

    let bouton =
        document.getElementById(
            "voirPlusPhotos"
        );


    if (bouton) {

        bouton.remove();

    }


    if (
        photosAffichees >=
        toutesLesPhotos.length
    ) {

        return;

    }


    bouton =
        document.createElement(
            "button"
        );


    bouton.id =
        "voirPlusPhotos";


    bouton.textContent =
        "📸 Voir plus de photos";


    bouton.addEventListener(
        "click",
        () => {

            afficherPhotosSuivantes();

        }
    );


    const gallerySection =
        document.getElementById(
            "gallerySection"
        );


    if (gallerySection) {

        gallerySection.appendChild(
            bouton
        );

    }
}


/* =========================================================
   PHOTO AGRANDIE
========================================================= */

function ouvrirPhoto(url) {

    const overlay =
        document.createElement("div");


    overlay.id =
        "photoOverlay";


    overlay.innerHTML = `
        <img
            src="${url}"
            alt="Photo agrandie"
        >
    `;


    overlay.addEventListener(
        "click",
        () => {

            overlay.remove();

        }
    );


    document.body.appendChild(
        overlay
    );
}


/* =========================================================
   TOP 3 DES PHOTOS
========================================================= */

async function chargerTopPhotos() {

    const container =
        document.getElementById(
            "topPhotos"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    /* RÉCUPÉRATION DES PHOTOS STORAGE */

    const {
        data: fichiers,
        error: storageError
    } =
        await supabaseClient.storage
            .from(BUCKET_PHOTOS)
            .list(DOSSIER_PHOTOS, {

                limit: 1000

            });


    if (storageError) {

        console.error(
            "Erreur Storage Top Photos :",
            storageError
        );

        return;
    }


    const photosStorage =
        (fichiers || [])
            .filter(estUneImage);


    const nomsPhotos =
        photosStorage.map(
            photo => photo.name
        );


    /* RÉCUPÉRATION DES LIKES */

    const {
        data: likes,
        error
    } =
        await supabaseClient
            .from("likes")
            .select("*");


    if (error) {

        console.error(error);

        return;
    }


    /* IGNORER LES LIKES
       QUI NE CORRESPONDENT PLUS
       À UNE PHOTO EXISTANTE */

    const likesValides =
        (likes || [])
            .filter(
                like =>
                    nomsPhotos.includes(
                        like.photo_name
                    )
            );


    const compteLikes = {};


    likesValides.forEach(
        like => {

            if (
                !compteLikes[
                    like.photo_name
                ]
            ) {

                compteLikes[
                    like.photo_name
                ] = 0;

            }


            compteLikes[
                like.photo_name
            ]++;

        }
    );


    const top3 =
        Object.entries(
            compteLikes
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            3
        );


    for (
        let i = 0;
        i < top3.length;
        i++
    ) {


        const [
            photoName,
            nbLikes
        ] =
            top3[i];


        const url =
            obtenirUrlPhoto(
                photoName
            );


        let medal =
            "🏅";


        if (i === 0) {
            medal = "🥇";
        }

        if (i === 1) {
            medal = "🥈";
        }

        if (i === 2) {
            medal = "🥉";
        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "topPhotoCard";


        card.innerHTML = `
            <img
                src="${url}"
                loading="lazy"
                alt="Photo du podium"
            >

            <p>
                ${medal} ❤️ ${nbLikes}
            </p>
        `;


        container.appendChild(
            card
        );

    }
}