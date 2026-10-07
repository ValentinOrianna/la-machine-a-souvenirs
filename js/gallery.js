let toutesLesPhotos = [];
let pageGalerie = 0;

const NOMBRE_PAR_PAGE = 20;

const BUCKET_PHOTOS = "photo mariage";
const DOSSIER_PHOTOS = "souvenirs";
const DOSSIER_APERCUS = "apercus";

const photosSelectionnees = new Set();
let telechargementEnCours = false;
const likesParPhoto = new Map();

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
function obtenirUrlApercu(nomFichier) {

    const chemin =
        `${DOSSIER_APERCUS}/${nomFichier}.preview.jpg`;

    const { data } =
        supabaseClient.storage
            .from(BUCKET_PHOTOS)
            .getPublicUrl(chemin);

    return data.publicUrl;
}
/* =========================================================
   CACHE DES LIKES
========================================================= */

async function chargerCompteursLikes() {

    likesParPhoto.clear();


    /* Likes déjà enregistrés dans Supabase */

    if (navigator.onLine) {

        const { data: likes, error } =
            await supabaseClient
                .from("likes")
                .select("photo_name");


        if (error) {

            console.error(
                "Erreur chargement des likes :",
                error
            );

        } else {

            (likes || []).forEach(
                like => {

                    const totalActuel =
                        likesParPhoto.get(
                            like.photo_name
                        ) || 0;


                    likesParPhoto.set(
                        like.photo_name,
                        totalActuel + 1
                    );

                }
            );

        }

    }


    /* Likes enregistrés hors ligne */

    try {

        const likesOffline =
            await recupererOffline(
                STORES.LIKES
            );


        (likesOffline || []).forEach(
            like => {

                const totalActuel =
                    likesParPhoto.get(
                        like.photo_name
                    ) || 0;


                likesParPhoto.set(
                    like.photo_name,
                    totalActuel + 1
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Erreur lecture likes hors ligne :",
            error
        );

    }

}


function obtenirNombreLikes(photoName) {

    return (
        likesParPhoto.get(
            photoName
        ) || 0
    );

}


function ajouterLikeCache(photoName) {

    likesParPhoto.set(
        photoName,
        obtenirNombreLikes(photoName) + 1
    );

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

     pageGalerie = 0;


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

preview_url:
    obtenirUrlApercu(photo.name),

likeKey:
    photo.name

                };

            });

const photosDisponibles =
    new Set(
        toutesLesPhotos.map(
            photo =>
                photo.storageName
        )
    );


for (
    const nomPhoto
    of photosSelectionnees
) {

    if (
        !photosDisponibles.has(
            nomPhoto
        )
    ) {

        photosSelectionnees.delete(
            nomPhoto
        );

    }

}


creerBarreSelection();

    const photoCount =
        document.getElementById("photoCount");


    if (photoCount) {

    photoCount.textContent =
        `📸 ${toutesLesPhotos.length} souvenirs capturés`;

}


/*
   Une seule récupération globale
   des likes au chargement.
*/

await chargerCompteursLikes();


/*
   Affichage de la première page.
*/

await afficherPageGalerie(0);

}


/* =========================================================
   AFFICHAGE DES PHOTOS
========================================================= */

async function afficherPageGalerie(numeroPage = pageGalerie) {

    const galleryGrid =
        document.getElementById("galleryGrid");


    if (!galleryGrid) {
        return;
    }


    const nombrePages =
        Math.max(
            1,
            Math.ceil(
                toutesLesPhotos.length /
                NOMBRE_PAR_PAGE
            )
        );


    pageGalerie =
        Math.min(
            Math.max(numeroPage, 0),
            nombrePages - 1
        );


    const debut =
        pageGalerie *
        NOMBRE_PAR_PAGE;


    const fin =
        debut +
        NOMBRE_PAR_PAGE;


    const photosAShow =
        toutesLesPhotos.slice(
            debut,
            fin
        );


    /*
       On retire les photos
       de la page précédente.
    */

    galleryGrid.innerHTML = "";


    for (const photo of photosAShow) {


        /* =========================
           CARTE PHOTO
        ========================= */

        const carte =
            document.createElement("div");

        carte.className =
            "photoCard";


        /* =========================
           PHOTO
        ========================= */

        const img =
            document.createElement("img");

            

       img.onerror = () => {

    img.onerror = null;

    img.src =
        photo.image_url;

};

img.src =
    photo.preview_url ||
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


        /* =========================
           SÉLECTION
        ========================= */

        const selectionButton =
            document.createElement(
                "button"
            );


        selectionButton.type =
            "button";


        selectionButton.className =
            "selectionPhotoButton";


        selectionButton.dataset.photoName =
            photo.storageName;


        selectionButton.setAttribute(
            "aria-label",
            "Sélectionner cette photo"
        );


        selectionButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    photosSelectionnees.has(
                        photo.storageName
                    )
                ) {

                    photosSelectionnees.delete(
                        photo.storageName
                    );

                }

                else {

                    photosSelectionnees.add(
                        photo.storageName
                    );

                }


                mettreAJourSelection();

            }
        );


        /* =========================
           LIKE
        ========================= */

        const likeButton =
            document.createElement(
                "button"
            );


        likeButton.className =
            "likeButton";


        const identifiantPhoto =
            photo.likeKey;


        const dejaLike =
            localStorage.getItem(
                `like-${identifiantPhoto}`
            );


        /*
           IMPORTANT :
           plus aucune requête Supabase
           individuelle ici.
        */

        const nombreLikes =
            obtenirNombreLikes(
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


                    /*
                       Mise à jour immédiate
                       du cache local des likes.
                    */

                    ajouterLikeCache(
                        identifiantPhoto
                    );


                    localStorage.setItem(
                        `like-${identifiantPhoto}`,
                        "true"
                    );


                    const nouveauTotal =
                        obtenirNombreLikes(
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


                /*
                   Supabase a accepté le like :
                   on met à jour notre cache.
                */

                ajouterLikeCache(
                    identifiantPhoto
                );


                localStorage.setItem(
                    `like-${identifiantPhoto}`,
                    "true"
                );


                const nouveauTotal =
                    obtenirNombreLikes(
                        identifiantPhoto
                    );


                likeButton.textContent =
                    `❤️ ${nouveauTotal}`;


                likeButton.disabled =
                    true;


                await chargerTopPhotos();

            }
        );


        /* =========================
           AJOUT DANS LA CARTE
        ========================= */

        carte.appendChild(
            img
        );


        carte.appendChild(
            selectionButton
        );


        carte.appendChild(
            likeButton
        );


        galleryGrid.appendChild(
            carte
        );

    }


    /*
       Remet correctement les coches
       des photos déjà sélectionnées.
    */

    mettreAJourSelection();


    /*
       Affiche Précédentes / Suivantes.
    */

    gererPagination();

}


/* =========================================================
   COMPTER LES LIKES
========================================================= */

async function compterLikes(photoName) {

    return obtenirNombreLikes(
        photoName
    );

}

/* =========================================================
   SÉLECTION DES PHOTOS
========================================================= */

function creerBarreSelection() {

    const galleryGrid =
        document.getElementById("galleryGrid");

    if (!galleryGrid) {
        return;
    }


    const ancienneBarre =
        document.getElementById("selectionPhotosBar");

    if (ancienneBarre) {
        ancienneBarre.remove();
    }


    const barre =
        document.createElement("div");

    barre.id = "selectionPhotosBar";

  barre.innerHTML = `

    <div id="selectionPhotosCount">
        0 photo sélectionnée
    </div>

    <div class="selectionPhotosActions">

        <button
            id="selectionnerToutesPhotos"
            type="button"
        >
            ☑ Tout sélectionner
        </button>

        <button
            id="deselectionnerToutesPhotos"
            type="button"
        >
            ✖ Désélectionner
        </button>

        <button
            id="enregistrerSelectionPhotos"
            type="button"
            disabled
        >
            📱 Envoyer mes photos
        </button>

        <button
            id="telechargerZipPhotos"
            type="button"
            disabled
        >
            📦 Télécharger en ZIP
        </button>

    </div>

`;


    galleryGrid.before(barre);


    document
        .getElementById("selectionnerToutesPhotos")
        .addEventListener(
            "click",
            () => {

                toutesLesPhotos.forEach(
                    photo => {

                        photosSelectionnees.add(
                            photo.storageName
                        );

                    }
                );

                mettreAJourSelection();

            }
        );


    document
    .getElementById("deselectionnerToutesPhotos")
    .addEventListener(
        "click",
        () => {

            photosSelectionnees.clear();

            mettreAJourSelection();

        }
    );


document
    .getElementById("enregistrerSelectionPhotos")
    .addEventListener(
        "click",
        partagerPhotosSelectionnees
    );


document
    .getElementById("telechargerZipPhotos")
    .addEventListener(
        "click",
        telechargerPhotosSelectionneesEnZip
    );


mettreAJourSelection();
}


function mettreAJourSelection() {

    const compteur =
        document.getElementById(
            "selectionPhotosCount"
        );


    const nombre =
        photosSelectionnees.size;


    if (compteur) {

        compteur.textContent =
            nombre === 1
                ? "1 photo sélectionnée"
                : `${nombre} photos sélectionnées`;

    }const boutonEnregistrer =
    document.getElementById(
        "enregistrerSelectionPhotos"
    );

const boutonZip =
    document.getElementById(
        "telechargerZipPhotos"
    );


if (!telechargementEnCours) {

    if (boutonEnregistrer) {

        boutonEnregistrer.disabled =
            nombre === 0;

        boutonEnregistrer.textContent =
            nombre === 0
                ? "📱 Envoyer mes photos"
                : nombre === 1
                    ? "📱 Enregistrer 1 photo"
                    : `📱 Enregistrer ${nombre} photos`;

    }


    if (boutonZip) {

        boutonZip.disabled =
            nombre === 0;

        boutonZip.textContent =
            nombre === 0
                ? "📦 Télécharger en ZIP"
                : nombre === 1
                    ? "📦 ZIP de 1 photo"
                    : `📦 ZIP de ${nombre} photos`;

    }

}


    document
        .querySelectorAll(
            ".selectionPhotoButton"
        )
        .forEach(
            bouton => {

                const nomPhoto =
                    bouton.dataset.photoName;


                const estSelectionnee =
                    photosSelectionnees.has(
                        nomPhoto
                    );


                bouton.textContent =
                    estSelectionnee
                        ? "☑"
                        : "☐";


                bouton.classList.toggle(
                    "selectionActive",
                    estSelectionnee
                );


                bouton.setAttribute(
                    "aria-pressed",
                    estSelectionnee
                        ? "true"
                        : "false"
                );

            }
        );
}

/* =========================================================
   RÉCUPÉRER LES PHOTOS SÉLECTIONNÉES
========================================================= */

async function recupererPhotosSelectionnees(bouton) {

    const photos =
        toutesLesPhotos.filter(
            photo =>
                photosSelectionnees.has(
                    photo.storageName
                )
        );


    const fichiers = [];
    const erreurs = [];


    for (
        let i = 0;
        i < photos.length;
        i++
    ) {

        const photo = photos[i];


        if (bouton) {

            bouton.textContent =
                `⬇ Récupération ${i + 1} / ${photos.length}`;

        }


        const {
            data: blob,
            error
        } =
            await supabaseClient.storage
                .from(BUCKET_PHOTOS)
                .download(
                    photo.storagePath
                );


        if (error || !blob) {

            console.error(
                "Erreur récupération photo :",
                photo.storageName,
                error
            );


            erreurs.push(
                photo.storageName
            );


            continue;
        }


        const fichier =
            new File(
                [blob],
                photo.storageName,
                {
                    type:
                        blob.type ||
                        "image/jpeg"
                }
            );


        fichiers.push(fichier);

    }


    return {
        fichiers,
        erreurs
    };
}


/* =========================================================
   ENREGISTRER / PARTAGER LES PHOTOS
========================================================= */

async function partagerPhotosSelectionnees() {

    if (telechargementEnCours) {
        return;
    }


    if (
        photosSelectionnees.size === 0
    ) {

        alert(
            "Sélectionnez au moins une photo."
        );

        return;
    }


    const bouton =
        document.getElementById(
            "enregistrerSelectionPhotos"
        );


    telechargementEnCours = true;


    if (bouton) {

        bouton.disabled = true;

        bouton.textContent =
            "⚙️ Préparation...";

    }


    try {

        const {
            fichiers,
            erreurs
        } =
            await recupererPhotosSelectionnees(
                bouton
            );


        if (!fichiers.length) {

            throw new Error(
                "Aucune photo récupérée."
            );

        }


        const partagePossible =
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files: fichiers
            });


        if (!partagePossible) {

            alert(
                "Le partage multiple n'est pas disponible sur ce téléphone.\n\nUn fichier ZIP va être préparé à la place."
            );


            await creerEtTelechargerZip(
                fichiers,
                bouton
            );


            return;
        }


        await navigator.share({

            files: fichiers,

            title:
                "La Machine à Souvenirs",

            text:
                "Photos du mariage"

        });


        if (erreurs.length > 0) {

            alert(
                `${erreurs.length} photo(s) n'ont pas pu être récupérée(s).`
            );

        }

    }

    catch (error) {

        /*
           AbortError = l'utilisateur
           a simplement fermé le menu.
        */

        if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                "Erreur partage photos :",
                error
            );


            alert(
                "Impossible de préparer les photos. Vous pouvez essayer le téléchargement ZIP."
            );

        }

    }

    finally {

        telechargementEnCours =
            false;


        mettreAJourSelection();

    }

}


/* =========================================================
   TÉLÉCHARGEMENT ZIP
========================================================= */

async function telechargerPhotosSelectionneesEnZip() {

    if (telechargementEnCours) {
        return;
    }


    if (
        photosSelectionnees.size === 0
    ) {

        alert(
            "Sélectionnez au moins une photo."
        );

        return;
    }


    const bouton =
        document.getElementById(
            "telechargerZipPhotos"
        );


    telechargementEnCours = true;


    if (bouton) {

        bouton.disabled = true;

        bouton.textContent =
            "⚙️ Préparation...";

    }


    try {

        const {
            fichiers,
            erreurs
        } =
            await recupererPhotosSelectionnees(
                bouton
            );


        if (!fichiers.length) {

            throw new Error(
                "Aucune photo récupérée."
            );

        }


        await creerEtTelechargerZip(
            fichiers,
            bouton
        );


        if (erreurs.length > 0) {

            alert(
                `${erreurs.length} photo(s) n'ont pas pu être ajoutée(s) au ZIP.`
            );

        }

    }

    catch (error) {

        console.error(
            "Erreur création ZIP :",
            error
        );


        alert(
            "Impossible de préparer le ZIP. Essayez avec moins de photos."
        );

    }

    finally {

        telechargementEnCours =
            false;


        mettreAJourSelection();

    }

}


/* =========================================================
   CRÉER LE ZIP
========================================================= */

async function creerEtTelechargerZip(
    fichiers,
    bouton = null
) {

    if (
        typeof JSZip ===
        "undefined"
    ) {

        throw new Error(
            "JSZip n'est pas chargé."
        );

    }


    const zip =
        new JSZip();


    fichiers.forEach(
        fichier => {

            zip.file(
                fichier.name,
                fichier
            );

        }
    );


    if (bouton) {

        bouton.textContent =
            "📦 Création du ZIP...";

    }


    const archive =
        await zip.generateAsync(

            {
                type: "blob",

                /*
                   Les photos JPG sont déjà
                   compressées. On évite de
                   les recompresser.
                */

                compression:
                    "STORE"
            },

            progression => {

                if (bouton) {

                    bouton.textContent =
                        `📦 Création ${Math.round(
                            progression.percent
                        )} %`;

                }

            }

        );


    const url =
        URL.createObjectURL(
            archive
        );


    const lien =
        document.createElement(
            "a"
        );


    lien.href =
        url;


    lien.download =
        "La-Machine-a-Souvenirs.zip";


    document.body.appendChild(
        lien
    );


    lien.click();


    lien.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        10000
    );

}


/* =========================================================
   PAGINATION GALERIE
========================================================= */

function gererPagination() {

    const gallerySection =
        document.getElementById(
            "gallerySection"
        );


    if (!gallerySection) {
        return;
    }


    const anciennePagination =
        document.getElementById(
            "paginationGalerie"
        );


    if (anciennePagination) {
        anciennePagination.remove();
    }


    const nombrePages =
        Math.ceil(
            toutesLesPhotos.length /
            NOMBRE_PAR_PAGE
        );


    if (nombrePages <= 1) {
    
    return;
    }


    const pagination =
        document.createElement("div");


    pagination.id =
        "paginationGalerie";


    /* BOUTON PRÉCÉDENT */

    const boutonPrecedent =
        document.createElement("button");


    boutonPrecedent.type =
        "button";


    boutonPrecedent.textContent =
        "← Précédentes";


    boutonPrecedent.disabled =
        pageGalerie === 0;


    boutonPrecedent.addEventListener(
        "click",
        async () => {

            await afficherPageGalerie(
                pageGalerie - 1
            );

            remettreGalerieEnVue();

        }
    );


    /* NUMÉRO DE PAGE */

    const indication =
        document.createElement("span");


    indication.className =
        "paginationGalerieInfo";


    indication.textContent =
        `Page ${pageGalerie + 1} / ${nombrePages}`;


    /* BOUTON SUIVANT */

    const boutonSuivant =
        document.createElement("button");


    boutonSuivant.type =
        "button";


    boutonSuivant.textContent =
        "Suivantes →";


    boutonSuivant.disabled =
        pageGalerie >= nombrePages - 1;


    boutonSuivant.addEventListener(
        "click",
        async () => {

            await afficherPageGalerie(
                pageGalerie + 1
            );

            remettreGalerieEnVue();

        }
    );


    pagination.appendChild(
        boutonPrecedent
    );


    pagination.appendChild(
        indication
    );


    pagination.appendChild(
        boutonSuivant
    );


    gallerySection.appendChild(
        pagination
    );

}


/* =========================================================
   REMONTER AU DÉBUT DE LA GALERIE
========================================================= */

function remettreGalerieEnVue() {

    const galleryGrid =
        document.getElementById(
            "galleryGrid"
        );


    if (!galleryGrid) {
        return;
    }


    galleryGrid.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

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
    obtenirUrlApercu(
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