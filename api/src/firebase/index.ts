import * as admin from 'firebase-admin'
import { DBUser } from 'types/user'
import { dbCollection } from './utils'

const serviceAcc = require(process.env.GOOGLE_APPLICATION_CREDENTIALS!)

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAcc),
  serviceAccountId:
    'firebase-adminsdk-dsvr8@devex-520d0.iam.gserviceaccount.com',
  projectId: 'devex-520d0',
})

export default function firebase() {
  return firebaseApp
}

export function userCollection() {
  return dbCollection(
    firebaseApp,
    'users'
  ) as FirebaseFirestore.CollectionReference<DBUser>
}

export function languagesCollection() {
  return dbCollection(
    firebaseApp,
    'languages'
  ) as FirebaseFirestore.CollectionReference<DBLanguage>
}
