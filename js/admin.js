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



        const { data: admin, error: adminError } =
            await supabaseClient
            .from("admins")
            .select("*")
            .eq(
                "email",
                user.email
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