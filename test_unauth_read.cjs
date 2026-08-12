const API_KEY = "AIzaSyAAQS8TPPUEH2AvQNfw_OwasKKNdhn-67w";
async function run() {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/gen-lang-client-0381307586/databases/ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008/documents/ambassadors`);
    const data = await res.json();
    console.log(data);
}
run();
