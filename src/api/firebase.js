import { getFirestore, collection } from "firebase/firestore";
import firebaseApp from "../firbase";

const firestore = getFirestore(firebaseApp);

export const boardsRef = collection(firestore, "boards");