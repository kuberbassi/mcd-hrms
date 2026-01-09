import { collection, getDocs, doc, writeBatch, serverTimestamp, query } from "firebase/firestore";
import { db } from "../firebase";

const OG_EMAILS = ["raj@mcd.in", "sonia@mcd.in", "amit@mcd.in", "priya@mcd.in", "vikram@mcd.in"];

const DEPARTMENTS = ["Sanitation", "Health", "Education", "Engineering", "Admin", "Horticulture"];
const ROLES = {
    Sanitation: ["Sanitation Worker", "Supervisor", "Driver"],
    Health: ["Doctor", "Nurse", "Ward Boy"],
    Education: ["Teacher", "Principal", "Clerk"],
    Engineering: ["Junior Engineer", "Laborer", "Surveyor"],
    Admin: ["Clerk", "Data Entry Operator"],
    Horticulture: ["Gardener", "Supervisor"]
};

const TASKS = [
    "Morning Ward Inspection", "Waste Collection Drive", "Fogging Operation", "School Maintenance Check",
    "Public Grievance Resolution", "Payroll Data Entry", "Site Survey", "Health Camp Duty",
    "Park Maintenance", "Street Light Audit"
];

const JOB_TITLES = ["Sanitation Supervisor", "Medical Officer", "Primary Teacher", "Civil Engineer (Contract)"];

// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to delete all docs in a collection/query
const deleteQueryBatch = async (q) => {
    const snapshot = await getDocs(q);
    if (snapshot.size === 0) return;
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
};

const clearSystemData = async () => {
    console.log("Cleaning up old data...");

    // 1. Clear Collections completely
    await deleteQueryBatch(collection(db, "attendance"));
    await deleteQueryBatch(collection(db, "payroll"));
    await deleteQueryBatch(collection(db, "performance"));
    await deleteQueryBatch(collection(db, "tasks"));
    await deleteQueryBatch(collection(db, "grievances"));
    await deleteQueryBatch(collection(db, "transfers"));
    await deleteQueryBatch(collection(db, "jobs"));
    await deleteQueryBatch(collection(db, "applications"));

    // 2. Clear Employees (EXCEPT OG)
    const empSnapshot = await getDocs(collection(db, "employees"));
    const empBatch = writeBatch(db);
    let deletedCount = 0;

    empSnapshot.forEach(doc => {
        const data = doc.data();
        if (!OG_EMAILS.includes(data.email)) {
            empBatch.delete(doc.ref);
            // Also try to delete from 'users' if possible, but 'users' might require Auth ID which we don't have easily for delete.
            // We'll focus on 'employees' list cleaning.
            deletedCount++;
        }
    });

    if (deletedCount > 0) await empBatch.commit();
    console.log("Cleanup complete.");
};

export const seedDatabase = async () => {
    const confirm = window.confirm("⚠️ WARNING: This will RESET all system data (Assignments, Attendance, etc.) and create new demo data. \n\nOriginal 5 employees will be preserved. \n\nContinue?");
    if (!confirm) return;

    try {
        await clearSystemData();
        console.log("Starting Seeding...");
        const batch = writeBatch(db);

        // --- 1. Get/Create Employees ---
        let allEmpRefs = [];

        // Fetch OG Employees
        const ogSnap = await getDocs(query(collection(db, "employees"))); // We just cleaned it, so only OG remain
        ogSnap.forEach(doc => allEmpRefs.push({ id: doc.id, ...doc.data() }));

        // Generate 20 New Employees
        const firstNames = ["Rahul", "Sita", "Gopal", "Meena", "Arif", "John", "Lakshmi", "Preeti", "Karan", "Simran", "Deepak", "Anju", "Harish", "Monika", "Puneet"];
        const lastNames = ["Verma", "Singh", "Khan", "Yadav", "Jain", "Das", "Nair", "Kaur", "Sharma", "Gupta"];

        const empCol = collection(db, "employees");

        for (let i = 0; i < 20; i++) {
            const fname = getRandom(firstNames);
            const lname = getRandom(lastNames);
            const dept = getRandom(DEPARTMENTS);
            const name = `${fname} ${lname}`;
            const email = `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@mcd.gov.in`; // unique email

            const newEmp = {
                name: name,
                email: email,
                dept: dept, // Schema uses 'dept'
                role: "employee", // User role
                post: getRandom(ROLES[dept]), // Schema uses 'post'
                empId: `MCD${1006 + i}`,
                time: serverTimestamp(), // CRITICAL for sorting
                phone: `98765${10000 + i}`,
                ward: `Ward-${100 + Math.floor(Math.random() * 50)}`
            };

            const docRef = doc(empCol);
            batch.set(docRef, newEmp);
            allEmpRefs.push({ id: docRef.id, ...newEmp });
        }

        // --- 2. Attendance (Last 30 Days) ---
        // 50% Present, 20% Absent, 10% Leave, 20% Weekend/Off (Approx)
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Skip Sundays (simple heuristic)
            if (date.getDay() === 0) continue;

            allEmpRefs.forEach(emp => {
                // Randomize attendance
                const rand = Math.random();
                let status = "present";
                if (rand > 0.85) status = "absent";
                else if (rand > 0.95) status = "leave";

                const attRef = doc(db, "attendance", `${dateStr}_${emp.id}`);
                batch.set(attRef, {
                    empId: emp.id,
                    date: dateStr,
                    status: status,
                    markedAt: serverTimestamp(),
                    markedBy: "System Admin"
                });
            });
        }

        // --- 3. Payroll (Linked to Attendance notionally) ---
        allEmpRefs.forEach(emp => {
            const payRef = doc(db, "payroll", emp.id);
            const basic = 15000 + Math.floor(Math.random() * 50000);
            const da = Math.floor(basic * 0.4);
            const hra = Math.floor(basic * 0.2);

            batch.set(payRef, {
                empId: emp.id,
                basic, da, hra,
                total: basic + da + hra,
                updatedAt: serverTimestamp()
            });
        });

        // --- 4. Performance Indicators ---
        allEmpRefs.forEach(emp => {
            const perfRef = doc(db, "performance", emp.id);
            batch.set(perfRef, {
                empId: emp.id,
                rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                comment: getRandom(["Consistent performance.", "Needs improvement in punctuality.", "Excellent fieldwork.", "Reliable and hardworking.", "Good output this month."]),
                updatedAt: serverTimestamp()
            });
        });

        // --- 5. Deployments (Tasks) ---
        // Assign 1-2 tasks to random employees
        allEmpRefs.forEach(emp => {
            if (Math.random() > 0.6) {
                const taskRef = doc(collection(db, "tasks"));
                batch.set(taskRef, {
                    title: getRandom(TASKS),
                    assignedTo: emp.email, // Task schema uses allocated email
                    assignedToName: emp.name,
                    description: "Standard operating procedure for this deployment.",
                    status: getRandom(["Pending", "In Progress", "Completed"]),
                    dueDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
                    createdAt: serverTimestamp()
                });
            }
        });

        // --- 6. Recruitment (Jobs & Applications) ---
        const jobCol = collection(db, "jobs");
        JOB_TITLES.forEach(title => {
            const jobRef = doc(jobCol);
            const jobId = jobRef.id;
            batch.set(jobRef, {
                title: title,
                department: getRandom(DEPARTMENTS),
                location: "Civic Center",
                type: "Contractual",
                description: `Hiring for ${title} role. 1 Year Contract.`,
                status: "open",
                createdAt: serverTimestamp()
            });

            // Add 1-2 dummy applications per job
            for (let k = 0; k < Math.floor(Math.random() * 3); k++) {
                const appRef = doc(collection(db, "applications"));
                batch.set(appRef, {
                    jobId: jobId,
                    jobTitle: title,
                    name: `Candidate ${k + 1}`,
                    email: `candidate${k}@example.com`,
                    status: "new",
                    submittedAt: serverTimestamp()
                });
            }
        });

        // --- 7. Grievances ---
        const grievancesCol = collection(db, "grievances");
        for (let g = 0; g < 8; g++) {
            const gRef = doc(grievancesCol);
            const emp = getRandom(allEmpRefs);
            batch.set(gRef, {
                title: getRandom(["Salary Discrepancy", "Leave Rejection", "Equipment Issue", "Transfer Request Delay"]),
                description: "Please look into this urgently.",
                category: "General",
                status: Math.random() > 0.5 ? "pending" : "resolved",
                submittedBy: emp.email,
                submittedAt: serverTimestamp()
            });
        }

        await batch.commit();
        console.log("Seeding Complete!");
        alert("✅ Dashboard Repopulated! \n\n- 20+ New Employees\n- 30 Days Attendance\n- Payroll & Performance Data\n- Deployments & Recruitment\n\nPlease REFRESH the page.");

    } catch (error) {
        console.error("Seed Error:", error);
        alert("❌ Error Seeding Data: " + error.message);
    }
};
