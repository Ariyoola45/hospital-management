import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./config";

const wardsRef = collection(db, "wards");

// Room/bed status values: "available" | "occupied" | "reserved" | "housekeeping" | "maintenance"

export async function createWard(ward) {
  return addDoc(wardsRef, {
    roomNumber: ward.roomNumber,
    type: ward.type,           // General | Private | ICU | Maternity | Pediatric
    rate: Number(ward.rate),   // daily bed charge
    floor: ward.floor || "",
    status: ward.status || "available",
    amenities: ward.amenities || [],
  });
}

export async function updateWard(id, data) {
  return updateDoc(doc(db, "wards", id), data);
}

export async function setWardStatus(id, status) {
  return updateDoc(doc(db, "wards", id), { status });
}

export async function deleteWard(id) {
  return deleteDoc(doc(db, "wards", id));
}

export async function listWards() {
  const q = query(wardsRef, orderBy("roomNumber", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listAvailableWards(type = null) {
  let q = query(wardsRef, where("status", "==", "available"));
  const snap = await getDocs(q);
  let wards = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (type) wards = wards.filter((r) => r.type === type);
  return wards;
}
