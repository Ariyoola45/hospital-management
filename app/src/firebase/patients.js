import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const patientsRef = collection(db, "patients");

export async function createPatient(patient) {
  return addDoc(patientsRef, {
    ...patient,
    createdAt: serverTimestamp(),
  });
}

export async function updatePatient(id, data) {
  return updateDoc(doc(db, "patients", id), data);
}

export async function deletePatient(id) {
  return deleteDoc(doc(db, "patients", id));
}

export async function listPatients() {
  const q = query(patientsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function findPatientByEmailOrPhone(value) {
  const byEmail = query(patientsRef, where("email", "==", value));
  const byPhone = query(patientsRef, where("phone", "==", value));
  const [emailSnap, phoneSnap] = await Promise.all([getDocs(byEmail), getDocs(byPhone)]);
  const docs = [...emailSnap.docs, ...phoneSnap.docs];
  return docs.map((d) => ({ id: d.id, ...d.data() }));
}
