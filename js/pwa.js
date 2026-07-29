if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("Service Worker enregistré :", registration);
      })
      .catch((error) => {
        console.error("Erreur Service Worker :", error);
      });
  });
}