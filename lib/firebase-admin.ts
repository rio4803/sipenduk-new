import admin from "firebase-admin";

if (!admin.apps.length){
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT as string
    )
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}


export const sendPush = async (message: any) => {
    await admin.messaging().sendEachForMulticast(message);
};


export const firebaseAdmin = admin