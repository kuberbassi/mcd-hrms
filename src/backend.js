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
    updateDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export async function getSystemConfig() {
    const docRef = doc(db, "system", "config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    // Default config if none exists
    return {
        hrAccess: {
            viewEmployees: true,
            markAttendance: true,
            managePayroll: false,
            approveTransfers: false
        }
    };
}

export async function updateSystemConfig(data) {
    const docRef = doc(db, "system", "config");
    await setDoc(docRef, data, { merge: true });
    return true;
}

export async function createEmployeeAccount(email, password, name, dept, empId, post, adminEmail, adminPassword) {
    // Create the auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Create the user profile with employee role
    await setDoc(doc(db, "users", newUser.uid), {
        email: email,
        role: "employee",
        name: name,
        createdAt: serverTimestamp()
    });

    // Add to employees collection
    await addDoc(collection(db, "employees"), {
        name: name,
        dept: dept,
        empId: empId,
        post: post,
        email: email,
        uid: newUser.uid,
        time: serverTimestamp()
    });

    // Sign back in as admin
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    return newUser;
}

// ============ LOGIN / LOGOUT ============

// Log in function
export async function login(email, password) {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

// Log out function
export async function logout() {
    await signOut(auth);
}

// ============ USER ROLE ============

// Get user role from Firestore (creates if missing)
export async function getUserRole(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data().role || "employee";
        } else {
            // Create default employee role
            await setDoc(userRef, {
                email: user.email,
                role: "employee",
                createdAt: serverTimestamp()
            });
            return "employee";
        }
    } catch (error) {
        console.error("Error getting user role:", error);
        return "employee";
    }
}

// Check if logged in and get role (real-time)
export function checkUser(callback) {
    let roleUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        // Cleanup old listener
        if (roleUnsubscribe) {
            roleUnsubscribe();
            roleUnsubscribe = null;
        }

        if (user) {
            const userRef = doc(db, "users", user.uid);

            // Listen for role changes
            roleUnsubscribe = onSnapshot(userRef, async (docSnap) => {
                if (docSnap.exists()) {
                    let role = docSnap.data().role || "employee";
                    // Clean up role string
                    role = role.replace(/['\"]+/g, "").trim().toLowerCase();
                    callback(user, role);
                } else {
                    // Create default
                    await setDoc(userRef, {
                        email: user.email,
                        role: "employee",
                        createdAt: serverTimestamp()
                    });
                }
            }, (error) => {
                console.error("Role listener error:", error);
                callback(user, "employee");
            });
        } else {
            callback(null, null);
        }
    });

    // Return cleanup function
    return () => {
        authUnsubscribe();
        if (roleUnsubscribe) roleUnsubscribe();
    };
}

// ============ EMPLOYEES ============

// Add a staff member
export async function addStaff(name, dept, id, post) {
    await addDoc(collection(db, "employees"), {
        name: name,
        dept: dept,
        empId: id,
        post: post,
        time: serverTimestamp()
    });
}

// Show all staff (real-time)
export function showStaff(callback) {
    const q = query(collection(db, "employees"), orderBy("time", "desc"));
    return onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((item) => {
            list.push({ id: item.id, ...item.data() });
        });
        callback(list);
    });
}

// Delete a staff member
export async function removeStaff(id) {
    await deleteDoc(doc(db, "employees", id));
}

// Update a staff member
export async function updateEmployee(id, data) {
    const employeeRef = doc(db, "employees", id);
    await updateDoc(employeeRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

// Update user role (Admin only)
export async function updateUserRole(email, newRole) {
    // 1. Find the user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const snapshot = await getDocs(q);

    let uid = null;
    snapshot.forEach(doc => {
        if (doc.data().email === email) {
            uid = doc.id;
        }
    });

    if (uid) {
        // 2. Update the role
        await updateDoc(doc(db, "users", uid), {
            role: newRole
        });
        return true;
    }
    return false;
}

// Demo password for all demo accounts
const DEMO_PASSWORD = "demo123";

// Demo employees list
const demoEmployees = [
    { name: "Raj Kumar", dept: "IT", empId: "MCD001", post: "Senior Developer", email: "raj@mcd.in" },
    { name: "Sonia Sharma", dept: "HR", empId: "MCD002", post: "HR Manager", email: "sonia@mcd.in" },
    { name: "Amit Singh", dept: "Finance", empId: "MCD003", post: "Accountant", email: "amit@mcd.in" },
    { name: "Priya Gupta", dept: "IT", empId: "MCD004", post: "UI Designer", email: "priya@mcd.in" },
    { name: "Vikram Patel", dept: "Admin", empId: "MCD005", post: "Office Manager", email: "vikram@mcd.in" }
];

// Create demo accounts with real Firebase Auth
// Admin must be logged in first
export async function makeFakeData(adminEmail, adminPassword) {
    let created = 0;
    let skipped = 0;
    let errors = [];

    for (const emp of demoEmployees) {
        try {
            // Try to create the auth account
            const userCredential = await createUserWithEmailAndPassword(auth, emp.email, DEMO_PASSWORD);
            const newUser = userCredential.user;

            // Create user profile with employee role
            await setDoc(doc(db, "users", newUser.uid), {
                email: emp.email,
                role: "employee",
                name: emp.name,
                createdAt: serverTimestamp()
            });

            // Add to employees collection
            await addDoc(collection(db, "employees"), {
                name: emp.name,
                dept: emp.dept,
                empId: emp.empId,
                post: emp.post,
                email: emp.email,
                uid: newUser.uid,
                time: serverTimestamp()
            });

            created++;

            // Sign back in as admin to continue creating more accounts
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        } catch (error) {
            console.error("Error creating " + emp.email + ":", error.code, error.message);

            if (error.code === "auth/email-already-in-use") {
                skipped++;
            } else {
                errors.push(emp.email + ": " + error.message);
            }
        }
    }

    // Make sure we're signed in as admin at the end
    try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (e) {
        console.error("Error signing back as admin:", e);
    }

    return { created, skipped, errors };
}

// ============ ATTENDANCE ============

export async function markAttendance(empId, date, status) {
    const docId = date + "_" + empId;
    await setDoc(doc(db, "attendance", docId), {
        empId: empId,
        date: date,
        status: status,
        markedAt: serverTimestamp()
    });
}

// Reset (delete) attendance for an employee on a specific date
export async function resetAttendance(empId, date) {
    const docId = date + "_" + empId;
    await deleteDoc(doc(db, "attendance", docId));
}

// Get attendance for a date (admin use)
export async function getAttendanceForDate(date) {
    const q = query(collection(db, "attendance"));
    const snapshot = await getDocs(q);
    const attendance = {};
    snapshot.forEach((item) => {
        const data = item.data();
        if (data.date === date) {
            attendance[data.empId] = data.status;
        }
    });
    return attendance;
}

// Get attendance history for an employee (by email)
export async function getMyAttendanceHistory(email) {
    // First find employee ID by email
    const empSnapshot = await getDocs(collection(db, "employees"));
    let empId = null;
    empSnapshot.forEach((item) => {
        if (item.data().email === email) {
            empId = item.id;
        }
    });

    if (!empId) return [];

    // Get all attendance for this employee
    const attSnapshot = await getDocs(collection(db, "attendance"));
    const history = [];
    attSnapshot.forEach((item) => {
        const data = item.data();
        if (data.empId === empId) {
            history.push({ date: data.date, status: data.status });
        }
    });

    // Sort by date descending
    history.sort((a, b) => b.date.localeCompare(a.date));
    return history;
}

// Get attendance stats for employee dashboard
export async function getAttendanceForEmployee(email) {
    const history = await getMyAttendanceHistory(email);
    let present = 0, absent = 0, leave = 0;
    history.forEach((h) => {
        if (h.status === "present") present++;
        else if (h.status === "absent") absent++;
        else if (h.status === "leave") leave++;
    });
    return { present, absent, leave };
}

// Get my payroll data (by email)
export async function getMyPayroll(email) {
    // First find employee ID by email
    const empSnapshot = await getDocs(collection(db, "employees"));
    let empId = null;
    empSnapshot.forEach((item) => {
        if (item.data().email === email) {
            empId = item.id;
        }
    });

    if (!empId) return null;

    // Get payroll for this employee
    const payrollDoc = await getDoc(doc(db, "payroll", empId));
    if (payrollDoc.exists()) {
        return payrollDoc.data();
    }
    if (payrollDoc.exists()) {
        return payrollDoc.data();
    }
    return null;
}

// Get full profile details (by email)
export async function getMyProfile(email) {
    const q = query(collection(db, "employees"));
    const snapshot = await getDocs(q);
    let profile = null;
    snapshot.forEach((item) => {
        if (item.data().email === email) {
            profile = { id: item.id, ...item.data() };
        }
    });
    return profile;
}

// ============ TRANSFERS ============

// Request a transfer
export async function requestTransfer(empId, empName, fromDept, toDept, reason, requestedBy) {
    await addDoc(collection(db, "transfers"), {
        empId: empId,
        empName: empName,
        fromDept: fromDept,
        toDept: toDept,
        reason: reason,
        status: "pending",
        requestedBy: requestedBy,
        requestedAt: serverTimestamp()
    });
}

// Get all transfers
export async function getTransfers() {
    const q = query(collection(db, "transfers"), orderBy("requestedAt", "desc"));
    const snapshot = await getDocs(q);
    const transfers = [];
    snapshot.forEach((item) => {
        transfers.push({ id: item.id, ...item.data() });
    });
    return transfers;
}

// Update transfer status
export async function updateTransferStatus(transferId, status) {
    await updateDoc(doc(db, "transfers", transferId), {
        status: status,
        updatedAt: serverTimestamp()
    });
}

// ============ PAYROLL ============

// Get payroll data for all employees
export async function getPayrollData() {
    const snapshot = await getDocs(collection(db, "payroll"));
    const payroll = {};
    snapshot.forEach((item) => {
        const data = item.data();
        payroll[data.empId] = {
            basic: data.basic || 0,
            da: data.da || 0,
            hra: data.hra || 0,
            total: (data.basic || 0) + (data.da || 0) + (data.hra || 0)
        };
    });
    return payroll;
}

// Update payroll for an employee
export async function updatePayroll(empId, basic, da, hra) {
    await setDoc(doc(db, "payroll", empId), {
        empId: empId,
        basic: basic,
        da: da,
        hra: hra,
        total: basic + da + hra,
        updatedAt: serverTimestamp()
    });
}

// ============ PERFORMANCE ============

// Get performance data
export async function getPerformanceData() {
    const snapshot = await getDocs(collection(db, "performance"));
    const ratings = {};
    snapshot.forEach((item) => {
        const data = item.data();
        ratings[data.empId] = {
            rating: data.rating || 0,
            comment: data.comment || ""
        };
    });
    return ratings;
}

// Save performance rating
export async function savePerformance(empId, rating, comment) {
    await setDoc(doc(db, "performance", empId), {
        empId: empId,
        rating: rating,
        comment: comment,
        updatedAt: serverTimestamp()
    });
}

// ============ GRIEVANCES ============

// Get all grievances
export async function getGrievances() {
    const q = query(collection(db, "grievances"), orderBy("submittedAt", "desc"));
    const snapshot = await getDocs(q);
    const complaints = [];
    snapshot.forEach((item) => {
        complaints.push({ id: item.id, ...item.data() });
    });
    return complaints;
}

// Submit a grievance
export async function submitGrievance(title, description, category, submittedBy) {
    await addDoc(collection(db, "grievances"), {
        title: title,
        description: description,
        category: category,
        status: "pending",
        submittedBy: submittedBy,
        submittedAt: serverTimestamp()
    });
}

// Resolve a grievance
export async function resolveGrievance(id) {
    await updateDoc(doc(db, "grievances", id), {
        status: "resolved",
        resolvedAt: serverTimestamp()
    });
}
