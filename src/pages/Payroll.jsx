import { useState, useEffect } from "react";
import { showStaff, getPayrollData, updatePayroll, getMyPayroll } from "../backend";

function Payroll({ role, user }) {
    const [employees, setEmployees] = useState([]); // Need to load staff for management view!

    // Add loadStaff function if not present or just use showStaff
    function loadStaff() {
        showStaff(setEmployees);
    }
    const [payrollData, setPayrollData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [myPayroll, setMyPayroll] = useState(null);

    useEffect(() => {
        if (role === "admin") {
            const unsubscribe = showStaff((list) => {
                setEmployees(list);
            });
            return () => {
                if (typeof unsubscribe === "function") unsubscribe();
            };
        }
    }, [role]);

    useEffect(() => {
        if (role === "admin") {
            loadPayroll();
        }
    }, [role]);

    useEffect(() => {
        if ((role === "employee" || role === "hr") && user) { // If HR & !Manage => Personal
            loadMyPayroll();
        }
        if (role === "admin") { // If HR & Manage => Admin View
            loadStaff();
        }
    }, [role, user]);

    async function loadPayroll() {
        const data = await getPayrollData();
        setPayrollData(data);
    }

    async function loadMyPayroll() {
        const data = await getMyPayroll(user.email);
        setMyPayroll(data);
    }

    async function handleSave(e, empId) {
        e.preventDefault();
        setSaving(true);

        const basic = Number(e.target.basic.value) || 0;
        const da = Number(e.target.da.value) || 0;
        const hra = Number(e.target.hra.value) || 0;

        try {
            await updatePayroll(empId, basic, da, hra);
            setPayrollData((old) => ({
                ...old,
                [empId]: { basic, da, hra, total: basic + da + hra },
            }));
            setEditingId(null);
        } catch (error) {
            alert("Error saving: " + error.message);
        } finally {
            setSaving(false);
        }
    }

    function getTotal(empId) {
        const data = payrollData[empId];
        if (!data) return 0;
        return (data.basic || 0) + (data.da || 0) + (data.hra || 0);
    }

    if (role === "employee" || role === "hr") {
        return (
            <div>
                <h4 className="fw-bold mb-4">💰 My Salary</h4>

                {!myPayroll ? (
                    <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: "15px" }}>
                        <p className="text-muted mb-0">Salary details not available yet. Please contact HR.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
                                <h5 className="fw-bold mb-4">Salary Breakdown</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">Basic Salary</td>
                                            <td className="text-end fw-medium">₹{(myPayroll.basic || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">Dearness Allowance (DA)</td>
                                            <td className="text-end fw-medium">₹{(myPayroll.da || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">House Rent Allowance (HRA)</td>
                                            <td className="text-end fw-medium">₹{(myPayroll.hra || 0).toLocaleString()}</td>
                                        </tr>
                                        <tr className="border-top">
                                            <td className="fw-bold">
                                                Total Monthly Salary
                                                <div className="small fw-normal text-muted fst-italic mt-1">* Salary paid on: Last day of the month</div>
                                            </td>
                                            <td className="text-end fw-bold text-success fs-4">
                                                ₹{((myPayroll.basic || 0) + (myPayroll.da || 0) + (myPayroll.hra || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}>
                                <h5 className="fw-bold mb-3 text-white">Annual Package</h5>
                                <h1 className="display-4 fw-bold text-white">
                                    ₹{(((myPayroll.basic || 0) + (myPayroll.da || 0) + (myPayroll.hra || 0)) * 12).toLocaleString()}
                                </h1>
                                <p className="text-white-50 mb-0">Per Year (before deductions)</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h4 className="fw-bold mb-4">💰 Payroll Management</h4>

            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Employee</th>
                            <th className="py-3">Department</th>
                            <th className="py-3 text-end">Basic (₹)</th>
                            <th className="py-3 text-end">DA (₹)</th>
                            <th className="py-3 text-end">HRA (₹)</th>
                            <th className="py-3 text-end">Total (₹)</th>
                            <th className="py-3 text-center">Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-muted">
                                    No employees found.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="align-middle">
                                    {editingId === emp.id ? (
                                        <td colSpan="7" className="p-3">
                                            <form className="row g-2 align-items-center" onSubmit={(e) => handleSave(e, emp.id)}>
                                                <div className="col-auto">
                                                    <strong>{emp.name}</strong>
                                                </div>
                                                <div className="col">
                                                    <input type="number" name="basic" className="form-control form-control-sm" placeholder="Basic" defaultValue={payrollData[emp.id]?.basic || ""} />
                                                </div>
                                                <div className="col">
                                                    <input type="number" name="da" className="form-control form-control-sm" placeholder="DA" defaultValue={payrollData[emp.id]?.da || ""} />
                                                </div>
                                                <div className="col">
                                                    <input type="number" name="hra" className="form-control form-control-sm" placeholder="HRA" defaultValue={payrollData[emp.id]?.hra || ""} />
                                                </div>
                                                <div className="col-auto">
                                                    <button className="btn btn-sm btn-success me-1" disabled={saving}>Save</button>
                                                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                                </div>
                                            </form>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-4 fw-medium">{emp.name}</td>
                                            <td>{emp.dept}</td>
                                            <td className="text-end">{payrollData[emp.id]?.basic?.toLocaleString() || "-"}</td>
                                            <td className="text-end">{payrollData[emp.id]?.da?.toLocaleString() || "-"}</td>
                                            <td className="text-end">{payrollData[emp.id]?.hra?.toLocaleString() || "-"}</td>
                                            <td className="text-end fw-bold text-success">₹{getTotal(emp.id).toLocaleString()}</td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingId(emp.id)}>Edit</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Payroll;
