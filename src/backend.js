import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc
} from "firebase/firestore";
import { auth, db } from "./firebase";

// This is for logging in
export async function login(email, password) {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

// This is for logging out
export async function logout() {
    await signOut(auth);
}

// Check if someone is logged in
export function checkUser(callback) {
    onAuthStateChanged(auth, callback);
}

// Add a new staff member
export async function addStaff(name, dept, id, post) {
    await addDoc(collection(db, "employees"), {
        name: name,
        dept: dept,
        empId: id,
        post: post,
        time: serverTimestamp()
    });
}

// Show all staff and update automatically
export function showStaff(callback) {
    const q = query(collection(db, "employees"), orderBy("time", "desc"));
    onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((item) => {
            list.push({ id: item.id, ...item.data() });
        });
        callback(list);
    });
}

// Remove staff member
export async function removeStaff(id) {
    await deleteDoc(doc(db, "employees", id));
}

// My dummy data for testing
export async function makeFakeData() {
    await addStaff("Raj Kumar", "IT", "101", "Boss");
    await addStaff("Sonia", "HR", "102", "Manager");
    alert("Fake data added!");
}
