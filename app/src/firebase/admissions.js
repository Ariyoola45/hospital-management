import {
  collection, addDoc, updateDoc, doc, getDocs,
  query, orderBy, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { setWardStatus } from "./wards";

const admissionsRef = collection(db, "admissions");

// Admission status: "booked" | "admitted" | "discharged" | "cancelled" | "no-show"

export async function createAdmission(admission) {
  // admission: { patientId, patientName, wardId, roomNumber, admissionDate, expectedDischargeDate, rate, notes }
  const docRef = await addDoc(admissionsRef, {
    ...admission,
    status: "booked",
    createdAt: serverTimestamp(),
  });
  await setWardStatus(admission.wardId, "reserved");
  return docRef;
}

export async function admitPatient(id, wardId) {
  await updateDoc(doc(db, "admissions", id), {
    status: "admitted",
    actualAdmissionTime: serverTimestamp(),
  });
  await setWardStatus(wardId, "occupied");
}

export async function dischargePatient(id, wardId) {
  await updateDoc(doc(db, "admissions", id), {
    status: "discharged",
    actualDischargeTime: serverTimestamp(),
  });
  // Ward goes to housekeeping for cleaning/sanitation before it can be marked available again
  await setWardStatus(wardId, "housekeeping");
}

export async function cancelAdmission(id, wardId) {
  await updateDoc(doc(db, "admissions", id), { status: "cancelled" });
  await setWardStatus(wardId, "available");
}

export async function listAdmissions() {
  const q = query(admissionsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAdmissionsByStatus(status) {
  const q = query(admissionsRef, where("status", "==", status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
