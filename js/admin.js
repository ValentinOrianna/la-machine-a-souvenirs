console.log("⚙️ Administration chargée");


const loginButton =
    document.getElementById("loginButton");


const loginMessage =
    document.getElementById("loginMessage");


const loginBox =
    document.getElementById("loginBox");


const adminPanel =
    document.getElementById("adminPanel");



loginButton.addEventListener(
    "click",
    async () => {


        const email =
            document.getElementById("adminEmail")
            .value
            .trim();


        const password =
            document.getElementById("adminPassword")
            .value;



        loginMessage.textContent =
            "Connexion...";



        const { data, error } =
            await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });



        if (error) {


            console.error(error);


            loginMessage.textContent =
                "❌ Identifiants incorrects";


            return;

        }



        const user =
            data.user;

            console.log(
           "Utilisateur connecté :",
            user.email
);


        const { data: admin, error: adminError } =
            await supabaseClient
            .from("admins")
            .select("*")
            .eq(
                "email",
                user.email
            )
            .maybeSingle(
 );



console.log(
    "Utilisateur Auth :",
    user.email
);


console.log(
    "Recherche admin avec :",
    user.email
);


const { data: admin, error: adminError } =
    await supabaseClient
    .from("admins")
    .select("*")
    .ilike(
        "email",
        user.email.trim()
    )
    .maybeSingle();



if (adminError || !admin) {


            console.error(adminError);


            await supabaseClient.auth.signOut();


            loginMessage.textContent =
                "❌ Accès administrateur refusé";


            return;

        }



        console.log(
            "✅ Administrateur connecté",
            admin
        );



        loginBox.style.display =
            "none";


        adminPanel.style.display =
            "block";


    }
);