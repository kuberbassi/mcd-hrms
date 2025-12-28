import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from "firebase/auth";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    where
} from "firebase/firestore";
import { auth, db } from "./firebase";

// --- EXISTING FUNCTIONS ---

export async function getSystemConfig() {
    const docRef = doc(db, "system", "config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return {
        hrAccess: {
            viewEmployees: true,
            markAttendance: true,
            managePayroll: false,
            approveTransfers: false
        }
    };
}

export function listenToSystemConfig(callback) {
    const docRef = doc(db, "system", "config");
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) callback(docSnap.data());
        else callback({
            hrAccess: { viewEmployees: true, markAttendance: true, managePayroll: false, approveTransfers: false }
        });
    });
}

export async function updateSystemConfig(data) {
    const docRef = doc(db, "system", "config");
    await setDoc(docRef, data, { merge: true });
    return true;
}

export async function createEmployeeAccount(email, password, name, dept, empId, post, adminEmail, adminPassword) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    await setDoc(doc(db, "users", newUser.uid), {
        email: email, role: "employee", name: name, createdAt: serverTimestamp()
    });
    await addDoc(collection(db, "employees"), {
        name: name, dept: dept, empId: empId, post: post, email: email, uid: newUser.uid, time: serverTimestamp()
    });
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    return newUser;
}

export async function login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
    await signOut(auth);
}

export async function getUserRole(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) return userDoc.data().role || "employee";
        await setDoc(userRef, { email: user.email, role: "employee", createdAt: serverTimestamp() });
        return "employee";
    } catch (error) {
        console.error("Error getting user role:", error);
        return "employee";
    }
}

export function checkUser(callback) {
    let roleUnsubscribe = null;
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (roleUnsubscribe) { roleUnsubscribe(); roleUnsubscribe = null; }
        if (user) {
            const userRef = doc(db, "users", user.uid);
            roleUnsubscribe = onSnapshot(userRef, async (docSnap) => {
                if (docSnap.exists()) {
                    let role = docSnap.data().role || "employee";
                    role = role.replace(/['"]+/g, "").trim().toLowerCase();
                    callback(user, role);
                } else {
                    await setDoc(userRef, { email: user.email, role: "employee", createdAt: serverTimestamp() });
                }
            }, (error) => { console.error(error); callback(user, "employee"); });
        } else {
            callback(null, null);
        }
    });
    return () => { authUnsubscribe(); if (roleUnsubscribe) roleUnsubscribe(); };
}

export async function addStaff(name, dept, id, post) {
    await addDoc(collection(db, "employees"), { name, dept, empId: id, post, time: serverTimestamp() });
}

export function showStaff(callback) {
    const q = query(collection(db, "employees"), orderBy("time", "desc"));
    return onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((item) => list.push({ id: item.id, ...item.data() }));
        callback(list);
    });
}

export async function removeStaff(id) {
    await deleteDoc(doc(db, "employees", id));
}

export async function updateEmployee(id, data) {
    const employeeRef = doc(db, "employees", id);
    await updateDoc(employeeRef, { ...data, updatedAt: serverTimestamp() });
}

export async function updateUserRole(email, newRole) {
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const snapshot = await getDocs(q);
    let uid = null;
    snapshot.forEach(doc => { if (doc.data().email === email) uid = doc.id; });
    if (uid) {
        await updateDoc(doc(db, "users", uid), { role: newRole });
        return true;
    }
    return false;
}

export async function getAllUserRoles() {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const roles = {};
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) roles[data.email] = data.role || "employee";
    });
    return roles;
}

// Demo Data Generation
const DEMO_PASSWORD = "demo123";
const demoEmployees = [
    { name: "Raj Kumar", dept: "IT", empId: "MCD001", post: "Senior Developer", email: "raj@mcd.in" },
    { name: "Sonia Sharma", dept: "HR", empId: "MCD002", post: "HR Manager", email: "sonia@mcd.in" },
    { name: "Amit Singh", dept: "Finance", empId: "MCD003", post: "Accountant", email: "amit@mcd.in" },
    { name: "Priya Gupta", dept: "IT", empId: "MCD004", post: "UI Designer", email: "priya@mcd.in" },
    { name: "Vikram Patel", dept: "Admin", empId: "MCD005", post: "Office Manager", email: "vikram@mcd.in" }
];

export async function makeFakeData(adminEmail, adminPassword) {
    const demoPayroll = {
        "raj@mcd.in": { basic: 80000, da: 32000, hra: 16000 },
        "sonia@mcd.in": { basic: 70000, da: 28000, hra: 14000 },
        "amit@mcd.in": { basic: 60000, da: 24000, hra: 12000 },
        "priya@mcd.in": { basic: 50000, da: 20000, hra: 10000 },
        "vikram@mcd.in": { basic: 40000, da: 16000, hra: 8000 }
    };
    let created = 0, skipped = 0, errors = [];
    try {
        for (const emp of demoEmployees) {
            let employeeDocId = null;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, emp.email, DEMO_PASSWORD);
                await setDoc(doc(db, "users", userCredential.user.uid), { email: emp.email, role: "employee", name: emp.name, createdAt: serverTimestamp() });
                const empRef = await addDoc(collection(db, "employees"), { name: emp.name, dept: emp.dept, empId: emp.empId, post: emp.post, email: emp.email, uid: userCredential.user.uid, time: serverTimestamp() });
                employeeDocId = empRef.id;
                created++;
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            } catch (error) {
                if (error.code === "auth/email-already-in-use") {
                    skipped++;
                } else {
                    errors.push(emp.email + ": " + error.message);
                }
            }
        }
    } catch (e) { console.error("Fatal error:", e); errors.push("Fatal: " + e.message); }
    try { if (auth.currentUser?.email !== adminEmail) await signInWithEmailAndPassword(auth, adminEmail, adminPassword); } catch (e) { }
    return { created, skipped, errors };
}

export async function markAttendance(empId, date, status) {
    const docId = date + "_" + empId;
    await setDoc(doc(db, "attendance", docId), { empId, date, status, markedAt: serverTimestamp() });
}

export async function resetAttendance(empId, date) {
    await deleteDoc(doc(db, "attendance", date + "_" + empId));
}

export async function getAttendanceForDate(date) {
    const q = query(collection(db, "attendance"));
    const snapshot = await getDocs(q);
    const attendance = {};
    snapshot.forEach((item) => { if (item.data().date === date) attendance[item.data().empId] = item.data().status; });
    return attendance;
}

export async function getMyAttendanceHistory(email) {
    const empSnapshot = await getDocs(collection(db, "employees"));
    let empId = null;
    empSnapshot.forEach((item) => { if (item.data().email === email) empId = item.id; });
    if (!empId) return [];
    const attSnapshot = await getDocs(collection(db, "attendance"));
    const history = [];
    attSnapshot.forEach((item) => { if (item.data().empId === empId) history.push({ date: item.data().date, status: item.data().status }); });
    history.sort((a, b) => b.date.localeCompare(a.date));
    return history;
}

export async function getAttendanceForEmployee(email) {
    const history = await getMyAttendanceHistory(email);
    let present = 0, absent = 0, leave = 0;
    history.forEach((h) => { if (h.status === "present") present++; else if (h.status === "absent") absent++; else if (h.status === "leave") leave++; });
    return { present, absent, leave };
}

export async function getMyPayroll(email) {
    const empSnapshot = await getDocs(collection(db, "employees"));
    let empId = null;
    empSnapshot.forEach((item) => { if (item.data().email === email) empId = item.id; });
    if (!empId) return null;
    const payrollDoc = await getDoc(doc(db, "payroll", empId));
    return payrollDoc.exists() ? payrollDoc.data() : null;
}

export async function getMyProfile(email) {
    const q = query(collection(db, "employees"));
    const snapshot = await getDocs(q);
    let profile = null;
    snapshot.forEach((item) => { if (item.data().email === email) profile = { id: item.id, ...item.data() }; });
    return profile;
}

export async function requestTransfer(empId, empName, fromDept, toDept, reason, requestedBy) {
    await addDoc(collection(db, "transfers"), { empId, empName, fromDept, toDept, reason, status: "pending", requestedBy, requestedAt: serverTimestamp() });
}

export async function getTransfers() {
    const q = query(collection(db, "transfers"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateTransferStatus(transferId, status) {
    await updateDoc(doc(db, "transfers", transferId), { status, updatedAt: serverTimestamp() });
}

export async function getPayrollData() {
    const snapshot = await getDocs(collection(db, "payroll"));
    const payroll = {};
    snapshot.forEach((item) => {
        const data = item.data();
        payroll[data.empId] = { basic: data.basic || 0, da: data.da || 0, hra: data.hra || 0, total: (data.basic || 0) + (data.da || 0) + (data.hra || 0) };
    });
    return payroll;
}

export async function updatePayroll(empId, basic, da, hra) {
    await setDoc(doc(db, "payroll", empId), { empId, basic, da, hra, total: basic + da + hra, updatedAt: serverTimestamp() });
}

export async function getPerformanceData() {
    const snapshot = await getDocs(collection(db, "performance"));
    const ratings = {};
    snapshot.forEach((item) => { ratings[item.data().empId] = { rating: item.data().rating || 0, comment: item.data().comment || "" }; });
    return ratings;
}

export async function savePerformance(empId, rating, comment) {
    await setDoc(doc(db, "performance", empId), { empId, rating, comment, updatedAt: serverTimestamp() });
}

export async function getGrievances() {
    const q = query(collection(db, "grievances"), orderBy("submittedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function submitGrievance(title, description, category, submittedBy) {
    await addDoc(collection(db, "grievances"), { title, description, category, status: "pending", submittedBy, submittedAt: serverTimestamp() });
}

export async function resolveGrievance(id) {
    await updateDoc(doc(db, "grievances", id), { status: "resolved", resolvedAt: serverTimestamp() });
}

// Task Management

// 1. Create a new task (Admin only)
export const assignTask = async (taskData) => {
    try {
        await addDoc(collection(db, "tasks"), {
            ...taskData,
            status: "Pending",
            employeeNotes: "",
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error assigning task:", error);
        return { success: false, error };
    }
};

// 2. Get all tasks (For Admin View)
export const getAllTasks = async () => {
    try {
        const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all tasks:", error);
        return [];
    }
};

// 3. Get tasks assigned to a specific employee (For Employee View)
export const getEmployeeTasks = async (employeeEmail) => {
    try {
        const q = query(
            collection(db, "tasks"),
            where("assignedTo", "==", employeeEmail)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const dateA = a.createdAt?.toMillis() || 0;
                const dateB = b.createdAt?.toMillis() || 0;
                return dateB - dateA;
            });
    } catch (error) {
        console.error("Error fetching employee tasks:", error);
        return [];
    }
};

// 4. Update task status and notes (For Employee)
export const updateTaskStatus = async (taskId, status, notes) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
            status: status,
            employeeNotes: notes
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        return { success: false, error };
    }
};

// Recruitment Module

// 1. Create a Job Posting (Admin/HR)
export async function createJobPosting(jobData) {
    try {
        await addDoc(collection(db, "jobs"), {
            ...jobData,
            status: "open",
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating job:", error);
        return { success: false, error };
    }
}

// 2. Get Job Postings (Admin/HR - All jobs; Public - Open jobs)
export async function getJobPostings(isAdmin = false) {
    try {
        let q;
        if (isAdmin) {
            q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        } else {
            q = query(
                collection(db, "jobs"),
                where("status", "==", "open"),
                orderBy("createdAt", "desc")
            );
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching jobs:", error);
        // Fallback for public view if index missing (or simply return empty)
        return [];
    }
}

// 3. Delete Job Posting (Admin/HR)
export async function deleteJobPosting(jobId) {
    try {
        await deleteDoc(doc(db, "jobs", jobId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting job:", error);
        return { success: false, error };
    }
}

// 4. Submit Application (Candidate)
export async function submitApplication(applicationData) {
    try {
        await addDoc(collection(db, "applications"), {
            ...applicationData,
            status: "new",
            submittedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error submitting application:", error);
        return { success: false, error };
    }
}

// 5. Get Applications (Admin/HR)
export async function getApplications(jobId = null) {
    try {
        let q;
        if (jobId) {
            q = query(collection(db, "applications"), where("jobId", "==", jobId), orderBy("submittedAt", "desc"));
        } else {
            q = query(collection(db, "applications"), orderBy("submittedAt", "desc"));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
}
