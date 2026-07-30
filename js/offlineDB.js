const OFFLINE_DB_NAME = "machine-souvenirs-offline";
const OFFLINE_DB_VERSION = 1;

const STORES = {
    PHOTOS: "photos",
    LIKES: "likes",
    MESSAGES: "messages"
};


function ouvrirOfflineDB() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            OFFLINE_DB_NAME,
            OFFLINE_DB_VERSION
        );


        request.onupgradeneeded = (event) => {

            const db = event.target.result;


            if (!db.objectStoreNames.contains(STORES.PHOTOS)) {

                db.createObjectStore(STORES.PHOTOS, {
                    keyPath: "id"
                });

            }


            if (!db.objectStoreNames.contains(STORES.LIKES)) {

                db.createObjectStore(STORES.LIKES, {
                    keyPath: "id"
                });

            }


            if (!db.objectStoreNames.contains(STORES.MESSAGES)) {

                db.createObjectStore(STORES.MESSAGES, {
                    keyPath: "id"
                });

            }

        };


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };


    });

}




async function ajouterOffline(type, element) {

    const db = await ouvrirOfflineDB();


    return new Promise((resolve, reject) => {


        const transaction = db.transaction(
            type,
            "readwrite"
        );


        const store = transaction.objectStore(type);


        const request = store.getAll();


        request.onsuccess = () => {


            const existants = request.result;


            const doublon = existants.find(
                item =>
                    item.signature &&
                    item.signature === element.signature
            );


            if (doublon) {


                console.log(
                    "⚠️ Élément déjà présent dans IndexedDB",
                    doublon
                );


                resolve(false);

                return;

            }



            const ajout = store.add(element);



            ajout.onsuccess = () => {


                console.log(
                    "💾 Ajout IndexedDB réussi",
                    element
                );


            };


            ajout.onerror = () => {


                console.error(
                    "❌ Erreur ajout IndexedDB",
                    ajout.error
                );


                reject(ajout.error);


            };


        };



        request.onerror = () => {


            console.error(
                "❌ Erreur lecture IndexedDB",
                request.error
            );


            reject(request.error);


        };



        transaction.oncomplete = () => {


            resolve(true);


        };



        transaction.onerror = () => {


            reject(transaction.error);


        };


    });

}




async function recupererOffline(type) {

    const db = await ouvrirOfflineDB();


    return new Promise((resolve, reject) => {


        const transaction = db.transaction(
            type,
            "readonly"
        );


        const store = transaction.objectStore(type);


        const request = store.getAll();


        request.onsuccess = () => {

            resolve(request.result);

        };


        request.onerror = () => {

            reject(request.error);

        };


    });

}




async function supprimerOffline(type, id) {

    const db = await ouvrirOfflineDB();


    return new Promise((resolve, reject) => {


        const transaction = db.transaction(
            type,
            "readwrite"
        );


        const store = transaction.objectStore(type);


        store.delete(id);


        transaction.oncomplete = () => {

            resolve(true);

        };


        transaction.onerror = () => {

            reject(transaction.error);

        };


    });

}




function genererIdOffline(prefix = "item") {

    return `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

}  function creerSignaturePhoto(file) {

    return `${file.name}-${file.size}-${file.lastModified}`;

}