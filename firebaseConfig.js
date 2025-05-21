import { initializeApp } from "firebase/app";
import { doc, deleteDoc, getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyC7otX2spjggC4acdLHQ661tlP7bGdIRiU",
    authDomain: "stripe-backend-2b07b.firebaseapp.com",
    databaseURL: "https://stripe-backend-2b07b-default-rtdb.firebaseio.com",
    projectId: "stripe-backend-2b07b",
    storageBucket: "stripe-backend-2b07b.firebasestorage.app",
    messagingSenderId: "564511324214",
    appId: "1:564511324214:web:89ffd2f136a80de3218097",
    measurementId: "G-TRSL3TQ3YP"
  };

 export const firebaseApp = initializeApp(firebaseConfig);
 export const db = getFirestore(firebaseApp);

 export const deleteDocument = async (collectionName, docId) => {
  console.log("collectionName",collectionName,docId)
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log('Document deleted successfully');
  } catch (error) {
    console.error('Error deleting document:', error);
  }
};