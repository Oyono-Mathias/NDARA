const API_KEY = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w";
const email = "admin-backend@ndara.com";
const password = "SuperSecretPassword123!";

async function run() {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    console.log(data);
}
run();
