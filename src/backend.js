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

// Log in function for the admin
export async function login(email, password) {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

// Log out function
export async function logout() {
    await signOut(auth);
}

// This checks if we are logged in or not
export function checkUser(callback) {
    onAuthStateChanged(auth, callback);
}

// My code to add a new staff member to the database
export async function addStaff(name, dept, id, post) {
    await addDoc(collection(db, "employees"), {
        name: name,
        dept: dept,
        empId: id,
        post: post,
        time: serverTimestamp()
    });
}

// This shows all staff and refreshes the list automatically
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

// Function to delete a staff member
export async function removeStaff(id) {
    await deleteDoc(doc(db, "employees", id));
}

// I made this fake data to test the app fast
export async function makeFakeData() {
    await addStaff("Raj Kumar", "IT", "101", "Boss");
    await addStaff("Sonia", "HR", "102", "Manager");
    alert("I added the fake data!");
}
