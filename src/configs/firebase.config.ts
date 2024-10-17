import firebaseAdmin from 'firebase-admin'
import serviceAccount from '../../public/firebase/firebase.sdk.json'

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as any)
});

export default firebaseAdmin
