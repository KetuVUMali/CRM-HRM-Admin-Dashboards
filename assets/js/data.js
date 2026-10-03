/* ==========================================================================
   HRM DASHBOARD — STATIC DATA LAYER
   All data below is fictional demo data for UI purposes only.
   Every page reads from this file instead of hardcoding markup.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* ROLES & PERMISSIONS                                                     */
/* ---------------------------------------------------------------------- */

const roles = ["super_admin", "admin", "hr_manager", "hr_executive", "payroll_manager", "manager", "team_lead", "employee"];

const roleLabels = {
  super_admin: "Super Admin", admin: "Admin", hr_manager: "HR Manager", hr_executive: "HR Executive",
  payroll_manager: "Payroll Manager", manager: "Manager", team_lead: "Team Lead", employee: "Employee"
};

const permissions = {
  employee: ["view_profile", "view_attendance", "apply_leave", "view_payslip", "view_directory", "submit_expense", "view_documents", "view_assets"],
  team_lead: ["view_profile", "view_attendance", "apply_leave", "view_payslip", "view_directory", "submit_expense", "view_team", "approve_team_leave", "view_team_attendance", "assign_tasks"],
  manager: ["view_profile", "view_attendance", "apply_leave", "view_payslip", "view_directory", "submit_expense", "view_team", "approve_team_leave", "view_team_attendance", "assign_tasks", "review_performance"],
  hr_executive: ["view_employees", "edit_employees", "view_attendance", "manage_leave", "manage_recruitment", "view_documents", "manage_onboarding", "view_reports"],
  hr_manager: ["view_employees", "manage_employees", "manage_leave", "view_attendance", "manage_recruitment", "manage_onboarding", "manage_performance", "manage_announcements", "view_reports", "manage_documents"],
  payroll_manager: ["view_payroll", "process_payroll", "manage_salary", "view_payslips", "manage_tax", "view_reports"],
  admin: ["view_employees", "manage_employees", "manage_leave", "view_attendance", "manage_recruitment", "manage_performance", "manage_assets", "manage_documents", "manage_announcements", "view_reports", "manage_settings", "view_payroll"],
  super_admin: ["view_employees", "manage_employees", "manage_leave", "view_attendance", "manage_recruitment", "manage_performance", "manage_assets", "manage_documents", "manage_announcements", "view_reports", "manage_settings", "view_payroll", "process_payroll", "manage_users", "manage_roles", "manage_permissions", "view_audit_log"]
};

function hasPermission(perm) {
  const user = getCurrentUser();
  return (permissions[user.role] || []).includes(perm);
}

/* ---------------------------------------------------------------------- */
/* DEMO USERS (role switcher) & CURRENT USER                               */
/* ---------------------------------------------------------------------- */

const demoUsers = {
  employee:        { id: "EMP001", empRef: "EMP001", name: "Aarav Sharma",   role: "employee",        designation: "Senior Developer",      department: "Engineering",       avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  team_lead:       { id: "EMP011", empRef: "EMP011", name: "Rahul Verma",    role: "team_lead",        designation: "Team Lead",              department: "Engineering",       avatar: "https://randomuser.me/api/portraits/men/54.jpg" },
  manager:         { id: "EMP010", empRef: "EMP010", name: "Kavita Joshi",   role: "manager",          designation: "Engineering Manager",    department: "Engineering",       avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  hr_executive:    { id: "EMP002", empRef: "EMP002", name: "Priya Patel",    role: "hr_executive",     designation: "HR Executive",           department: "Human Resources",   avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  hr_manager:      { id: "EMP006", empRef: "EMP006", name: "Anjali Nair",    role: "hr_manager",       designation: "HR Manager",             department: "Human Resources",   avatar: "https://randomuser.me/api/portraits/women/23.jpg" },
  payroll_manager: { id: "EMP005", empRef: "EMP005", name: "Vikram Singh",   role: "payroll_manager",  designation: "Payroll Manager",        department: "Finance",           avatar: "https://randomuser.me/api/portraits/men/76.jpg" },
  admin:           { id: "EMP015", empRef: "EMP015", name: "Sanjay Gupta",   role: "admin",            designation: "System Administrator",   department: "IT",                avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
  super_admin:     { id: "EMP021", empRef: "EMP021", name: "Amitabh Sinha",  role: "super_admin",      designation: "Super Administrator",    department: "IT",                avatar: "https://randomuser.me/api/portraits/men/85.jpg" }
};

function getCurrentUser() {
  const role = localStorage.getItem("hrmRole") || "employee";
  return demoUsers[role] || demoUsers.employee;
}
function setCurrentRole(role) {
  localStorage.setItem("hrmRole", role);
}

/* ---------------------------------------------------------------------- */
/* EMPLOYEES                                                                */
/* ---------------------------------------------------------------------- */

const employees = [
  { id: "EMP001", name: "Aarav Sharma", firstName: "Aarav", lastName: "Sharma", designation: "Senior Developer", department: "Engineering", email: "aarav.sharma@nimbushr.com", phone: "+91 98765 43210", gender: "Male", dob: "1993-04-12", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2021-03-14", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/32.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560103", basic: 62000, hra: 24800, allowances: 9500, bonus: 5000, deductions: 4400, tax: 6100 },
  { id: "EMP002", name: "Priya Patel", firstName: "Priya", lastName: "Patel", designation: "HR Executive", department: "Human Resources", email: "priya.patel@nimbushr.com", phone: "+91 98765 43211", gender: "Female", dob: "1995-07-22", maritalStatus: "Single", bloodGroup: "O+", joiningDate: "2022-01-10", manager: "Anjali Nair", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/44.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560068", basic: 42000, hra: 16800, allowances: 6000, bonus: 3000, deductions: 3100, tax: 2600 },
  { id: "EMP003", name: "Rohan Mehta", firstName: "Rohan", lastName: "Mehta", designation: "Software Engineer", department: "Engineering", email: "rohan.mehta@nimbushr.com", phone: "+91 98765 43212", gender: "Male", dob: "1996-11-02", maritalStatus: "Single", bloodGroup: "A+", joiningDate: "2022-06-01", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/22.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560034", basic: 48000, hra: 19200, allowances: 6500, bonus: 3000, deductions: 3300, tax: 3100 },
  { id: "EMP004", name: "Sneha Iyer", firstName: "Sneha", lastName: "Iyer", designation: "UI/UX Designer", department: "Engineering", email: "sneha.iyer@nimbushr.com", phone: "+91 98765 43213", gender: "Female", dob: "1997-02-18", maritalStatus: "Single", bloodGroup: "AB+", joiningDate: "2022-09-19", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Remote", status: "Active", avatar: "https://randomuser.me/api/portraits/women/56.jpg", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", basic: 46000, hra: 18400, allowances: 6200, bonus: 3000, deductions: 3200, tax: 2900 },
  { id: "EMP005", name: "Vikram Singh", firstName: "Vikram", lastName: "Singh", designation: "Payroll Manager", department: "Finance", email: "vikram.singh@nimbushr.com", phone: "+91 98765 43214", gender: "Male", dob: "1988-05-30", maritalStatus: "Married", bloodGroup: "O-", joiningDate: "2019-04-22", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/76.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560001", basic: 68000, hra: 27200, allowances: 10500, bonus: 6000, deductions: 4900, tax: 7400 },
  { id: "EMP006", name: "Anjali Nair", firstName: "Anjali", lastName: "Nair", designation: "HR Manager", department: "Human Resources", email: "anjali.nair@nimbushr.com", phone: "+91 98765 43215", gender: "Female", dob: "1990-09-08", maritalStatus: "Married", bloodGroup: "B-", joiningDate: "2018-11-05", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/23.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560095", basic: 71000, hra: 28400, allowances: 11000, bonus: 6000, deductions: 5100, tax: 8000 },
  { id: "EMP007", name: "Karan Malhotra", firstName: "Karan", lastName: "Malhotra", designation: "Sales Executive", department: "Sales", email: "karan.malhotra@nimbushr.com", phone: "+91 98765 43216", gender: "Male", dob: "1994-12-25", maritalStatus: "Single", bloodGroup: "A-", joiningDate: "2021-07-19", manager: "Gaurav Kapoor", employmentType: "Full-Time", workLocation: "Mumbai Office", status: "Active", avatar: "https://randomuser.me/api/portraits/men/12.jpg", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400051", basic: 40000, hra: 16000, allowances: 7000, bonus: 4000, deductions: 2900, tax: 2200 },
  { id: "EMP008", name: "Neha Kapoor", firstName: "Neha", lastName: "Kapoor", designation: "Marketing Specialist", department: "Marketing", email: "neha.kapoor@nimbushr.com", phone: "+91 98765 43217", gender: "Female", dob: "1995-03-14", maritalStatus: "Single", bloodGroup: "B+", joiningDate: "2022-02-08", manager: "Anjali Nair", employmentType: "Full-Time", workLocation: "Mumbai Office", status: "Active", avatar: "https://randomuser.me/api/portraits/women/33.jpg", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400059", basic: 44000, hra: 17600, allowances: 6200, bonus: 3000, deductions: 3100, tax: 2700 },
  { id: "EMP009", name: "Arjun Reddy", firstName: "Arjun", lastName: "Reddy", designation: "QA Engineer", department: "Engineering", email: "arjun.reddy@nimbushr.com", phone: "+91 98765 43218", gender: "Male", dob: "1996-08-27", maritalStatus: "Single", bloodGroup: "O+", joiningDate: "2022-10-03", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/62.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560017", basic: 45000, hra: 18000, allowances: 6100, bonus: 3000, deductions: 3100, tax: 2700 },
  { id: "EMP010", name: "Kavita Joshi", firstName: "Kavita", lastName: "Joshi", designation: "Engineering Manager", department: "Engineering", email: "kavita.joshi@nimbushr.com", phone: "+91 98765 43219", gender: "Female", dob: "1987-01-30", maritalStatus: "Married", bloodGroup: "A+", joiningDate: "2017-08-14", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/68.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560066", basic: 92000, hra: 36800, allowances: 14000, bonus: 8000, deductions: 6500, tax: 12400 },
  { id: "EMP011", name: "Rahul Verma", firstName: "Rahul", lastName: "Verma", designation: "Team Lead", department: "Engineering", email: "rahul.verma@nimbushr.com", phone: "+91 98765 43220", gender: "Male", dob: "1992-06-19", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2019-12-02", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/54.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560078", basic: 68000, hra: 27200, allowances: 9800, bonus: 5000, deductions: 4700, tax: 6900 },
  { id: "EMP012", name: "Meera Pillai", firstName: "Meera", lastName: "Pillai", designation: "Financial Analyst", department: "Finance", email: "meera.pillai@nimbushr.com", phone: "+91 98765 43221", gender: "Female", dob: "1994-10-11", maritalStatus: "Single", bloodGroup: "O+", joiningDate: "2021-05-17", manager: "Vikram Singh", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/50.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560025", basic: 50000, hra: 20000, allowances: 7000, bonus: 3500, deductions: 3600, tax: 3600 },
  { id: "EMP013", name: "Aditya Kumar", firstName: "Aditya", lastName: "Kumar", designation: "DevOps Engineer", department: "Engineering", email: "aditya.kumar@nimbushr.com", phone: "+91 98765 43222", gender: "Male", dob: "1993-02-05", maritalStatus: "Married", bloodGroup: "A+", joiningDate: "2020-09-28", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Remote", status: "Active", avatar: "https://randomuser.me/api/portraits/men/45.jpg", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500081", basic: 58000, hra: 23200, allowances: 8200, bonus: 4500, deductions: 4100, tax: 5200 },
  { id: "EMP014", name: "Divya Menon", firstName: "Divya", lastName: "Menon", designation: "Customer Support Lead", department: "Customer Support", email: "divya.menon@nimbushr.com", phone: "+91 98765 43223", gender: "Female", dob: "1991-04-23", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2019-03-11", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Chennai Office", status: "Active", avatar: "https://randomuser.me/api/portraits/women/61.jpg", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600028", basic: 54000, hra: 21600, allowances: 7500, bonus: 4000, deductions: 3800, tax: 4300 },
  { id: "EMP015", name: "Sanjay Gupta", firstName: "Sanjay", lastName: "Gupta", designation: "System Administrator", department: "IT", email: "sanjay.gupta@nimbushr.com", phone: "+91 98765 43224", gender: "Male", dob: "1985-12-01", maritalStatus: "Married", bloodGroup: "O+", joiningDate: "2016-02-15", manager: "Amitabh Sinha", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/41.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560037", basic: 78000, hra: 31200, allowances: 12000, bonus: 6500, deductions: 5500, tax: 9700 },
  { id: "EMP016", name: "Pooja Desai", firstName: "Pooja", lastName: "Desai", designation: "Recruiter", department: "Human Resources", email: "pooja.desai@nimbushr.com", phone: "+91 98765 43225", gender: "Female", dob: "1996-07-09", maritalStatus: "Single", bloodGroup: "A+", joiningDate: "2023-01-23", manager: "Anjali Nair", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/29.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560043", basic: 38000, hra: 15200, allowances: 5500, bonus: 2500, deductions: 2800, tax: 1900 },
  { id: "EMP017", name: "Manish Agarwal", firstName: "Manish", lastName: "Agarwal", designation: "Business Analyst", department: "Operations", email: "manish.agarwal@nimbushr.com", phone: "+91 98765 43226", gender: "Male", dob: "1993-09-17", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2021-11-08", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "On Leave", avatar: "https://randomuser.me/api/portraits/men/38.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560011", basic: 52000, hra: 20800, allowances: 7200, bonus: 3500, deductions: 3700, tax: 3900 },
  { id: "EMP018", name: "Ritu Chawla", firstName: "Ritu", lastName: "Chawla", designation: "Content Writer", department: "Marketing", email: "ritu.chawla@nimbushr.com", phone: "+91 98765 43227", gender: "Female", dob: "1997-05-26", maritalStatus: "Single", bloodGroup: "O+", joiningDate: "2023-04-17", manager: "Anjali Nair", employmentType: "Contract", workLocation: "Remote", status: "Active", avatar: "https://randomuser.me/api/portraits/women/71.jpg", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001", basic: 34000, hra: 13600, allowances: 4800, bonus: 1500, deductions: 2400, tax: 1300 },
  { id: "EMP019", name: "Suresh Yadav", firstName: "Suresh", lastName: "Yadav", designation: "Network Engineer", department: "IT", email: "suresh.yadav@nimbushr.com", phone: "+91 98765 43228", gender: "Male", dob: "1990-01-19", maritalStatus: "Married", bloodGroup: "AB+", joiningDate: "2018-06-25", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/49.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560029", basic: 49000, hra: 19600, allowances: 6800, bonus: 3200, deductions: 3400, tax: 3000 },
  { id: "EMP020", name: "Deepika Rao", firstName: "Deepika", lastName: "Rao", designation: "Product Manager", department: "Engineering", email: "deepika.rao@nimbushr.com", phone: "+91 98765 43229", gender: "Female", dob: "1989-11-30", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2018-01-09", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/81.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560002", basic: 88000, hra: 35200, allowances: 13000, bonus: 7500, deductions: 6200, tax: 11500 },
  { id: "EMP021", name: "Amitabh Sinha", firstName: "Amitabh", lastName: "Sinha", designation: "Super Administrator", department: "IT", email: "amitabh.sinha@nimbushr.com", phone: "+91 98765 43230", gender: "Male", dob: "1982-03-03", maritalStatus: "Married", bloodGroup: "O-", joiningDate: "2015-05-04", manager: "—", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/men/85.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560008", basic: 105000, hra: 42000, allowances: 16000, bonus: 10000, deductions: 7400, tax: 16800 },
  { id: "EMP022", name: "Nisha Bhatt", firstName: "Nisha", lastName: "Bhatt", designation: "Accountant", department: "Finance", email: "nisha.bhatt@nimbushr.com", phone: "+91 98765 43231", gender: "Female", dob: "1995-08-14", maritalStatus: "Single", bloodGroup: "A+", joiningDate: "2022-03-21", manager: "Vikram Singh", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active", avatar: "https://randomuser.me/api/portraits/women/39.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560020", basic: 41000, hra: 16400, allowances: 5800, bonus: 2500, deductions: 2900, tax: 2400 },
  { id: "EMP023", name: "Gaurav Kapoor", firstName: "Gaurav", lastName: "Kapoor", designation: "Sales Manager", department: "Sales", email: "gaurav.kapoor@nimbushr.com", phone: "+91 98765 43232", gender: "Male", dob: "1986-10-06", maritalStatus: "Married", bloodGroup: "B+", joiningDate: "2017-02-27", manager: "Sanjay Gupta", employmentType: "Full-Time", workLocation: "Mumbai Office", status: "Active", avatar: "https://randomuser.me/api/portraits/men/67.jpg", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001", basic: 75000, hra: 30000, allowances: 11500, bonus: 7000, deductions: 5300, tax: 8900 },
  { id: "EMP024", name: "Tanvi Shah", firstName: "Tanvi", lastName: "Shah", designation: "Junior Developer", department: "Engineering", email: "tanvi.shah@nimbushr.com", phone: "+91 98765 43233", gender: "Female", dob: "1999-06-12", maritalStatus: "Single", bloodGroup: "O+", joiningDate: "2026-07-01", manager: "Kavita Joshi", employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Probation", avatar: "https://randomuser.me/api/portraits/women/12.jpg", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560103", basic: 34000, hra: 13600, allowances: 4200, bonus: 0, deductions: 2400, tax: 1100 }
];

employees.forEach(e => {
  e.gross = e.basic + e.hra + e.allowances + e.bonus;
  e.net = e.gross - e.deductions - e.tax;
});

function getEmployeeById(id) { return employees.find(e => e.id === id); }
function getEmployeeByName(name) { return employees.find(e => e.name === name); }

/* ---------------------------------------------------------------------- */
/* DEPARTMENTS & DESIGNATIONS                                              */
/* ---------------------------------------------------------------------- */

const departments = [
  { name: "Engineering", head: "Kavita Joshi", employeeCount: 9, location: "Bengaluru HQ", status: "Active" },
  { name: "Human Resources", head: "Anjali Nair", employeeCount: 3, location: "Bengaluru HQ", status: "Active" },
  { name: "Finance", head: "Vikram Singh", employeeCount: 3, location: "Bengaluru HQ", status: "Active" },
  { name: "Sales", head: "Gaurav Kapoor", employeeCount: 2, location: "Mumbai Office", status: "Active" },
  { name: "Marketing", head: "Anjali Nair", employeeCount: 2, location: "Mumbai Office", status: "Active" },
  { name: "Operations", head: "Sanjay Gupta", employeeCount: 1, location: "Bengaluru HQ", status: "Active" },
  { name: "IT", head: "Amitabh Sinha", employeeCount: 3, location: "Bengaluru HQ", status: "Active" },
  { name: "Customer Support", head: "Divya Menon", employeeCount: 1, location: "Chennai Office", status: "Active" }
];

const designations = [
  { title: "Intern", department: "Engineering", level: "L0", employeeCount: 0, status: "Active" },
  { title: "Junior Developer", department: "Engineering", level: "L1", employeeCount: 1, status: "Active" },
  { title: "Software Engineer", department: "Engineering", level: "L2", employeeCount: 1, status: "Active" },
  { title: "Senior Developer", department: "Engineering", level: "L3", employeeCount: 1, status: "Active" },
  { title: "Team Lead", department: "Engineering", level: "L4", employeeCount: 1, status: "Active" },
  { title: "Engineering Manager", department: "Engineering", level: "L5", employeeCount: 1, status: "Active" },
  { title: "HR Executive", department: "Human Resources", level: "L2", employeeCount: 1, status: "Active" },
  { title: "HR Manager", department: "Human Resources", level: "L4", employeeCount: 1, status: "Active" },
  { title: "Director", department: "Operations", level: "L6", employeeCount: 0, status: "Active" }
];

/* ---------------------------------------------------------------------- */
/* ATTENDANCE                                                               */
/* ---------------------------------------------------------------------- */

const attendanceStatuses = ["Present", "Absent", "Late", "Half Day", "On Leave", "Holiday", "Weekend"];

const attendanceToday = employees.map((e, i) => {
  const cycle = ["Present", "Present", "Present", "Late", "Present", "On Leave", "Present", "Present", "Half Day", "Present", "Present", "Absent"];
  const status = e.status === "On Leave" ? "On Leave" : cycle[i % cycle.length];
  const checkIn = status === "Absent" || status === "On Leave" ? "--" : (status === "Late" ? "10:1" + (i % 9) + " AM" : "09:2" + (i % 9) + " AM");
  const checkOut = status === "Absent" || status === "On Leave" ? "--" : (status === "Half Day" ? "02:15 PM" : "06:3" + (i % 9) + " PM");
  const workingHours = status === "Absent" || status === "On Leave" ? "0h 0m" : (status === "Half Day" ? "04h 10m" : "08h " + (20 + (i % 30)) + "m");
  return { employeeId: e.id, name: e.name, avatar: e.avatar, designation: e.designation, department: e.department, date: "2026-09-19", checkIn, checkOut, workingHours, late: status === "Late", overtime: i % 5 === 0 ? "0h 45m" : "0h 0m", status };
});

const attendanceKpis = {
  presentToday: attendanceToday.filter(a => a.status === "Present").length,
  absentToday: attendanceToday.filter(a => a.status === "Absent").length,
  lateToday: attendanceToday.filter(a => a.status === "Late").length,
  onLeaveToday: attendanceToday.filter(a => a.status === "On Leave").length,
  attendancePct: 94.2
};

// A month of attendance history for the demo "employee" user (EMP001), for the calendar view
function buildMonthAttendance(year, month) {
  const days = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    let status = "P";
    if (dow === 0 || dow === 6) status = "WE";
    else if (d === 2 || d === 16) status = "L";
    else if (d === 19 && month === 8) status = "H";
    else if (d % 13 === 0) status = "WFH";
    else if (d > new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) status = "";
    out.push({ day: d, dow, status });
  }
  return out;
}

const shifts = [
  { name: "General Shift", start: "09:30 AM", end: "06:30 PM", breakMins: 60, gracePeriod: "10 min", workingDays: "Mon–Fri", status: "Active" },
  { name: "Morning Shift", start: "07:00 AM", end: "04:00 PM", breakMins: 45, gracePeriod: "10 min", workingDays: "Mon–Sat", status: "Active" },
  { name: "Night Shift", start: "10:00 PM", end: "07:00 AM", breakMins: 45, gracePeriod: "15 min", workingDays: "Mon–Fri", status: "Active" },
  { name: "Flexi Shift", start: "10:30 AM", end: "07:30 PM", breakMins: 60, gracePeriod: "20 min", workingDays: "Mon–Fri", status: "Inactive" }
];

const overtimeRecords = [
  { employee: "Aditya Kumar", date: "2026-09-15", regularHours: 8, overtimeHours: 2, rate: 450, amount: 900, status: "Approved" },
  { employee: "Rohan Mehta", date: "2026-09-16", regularHours: 8, overtimeHours: 1.5, rate: 400, amount: 600, status: "Approved" },
  { employee: "Suresh Yadav", date: "2026-09-17", regularHours: 8, overtimeHours: 3, rate: 420, amount: 1260, status: "Pending" },
  { employee: "Arjun Reddy", date: "2026-09-18", regularHours: 8, overtimeHours: 2, rate: 400, amount: 800, status: "Pending" },
  { employee: "Divya Menon", date: "2026-09-14", regularHours: 8, overtimeHours: 1, rate: 430, amount: 430, status: "Rejected" }
];

/* ---------------------------------------------------------------------- */
/* LEAVE                                                                    */
/* ---------------------------------------------------------------------- */

const leaveTypes = [
  { name: "Annual Leave", daysPerYear: 18, carryForward: "Yes (max 6)", paidUnpaid: "Paid", approvalRequired: "Yes", status: "Active" },
  { name: "Casual Leave", daysPerYear: 12, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "Yes", status: "Active" },
  { name: "Sick Leave", daysPerYear: 10, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "No", status: "Active" },
  { name: "Maternity Leave", daysPerYear: 182, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "Yes", status: "Active" },
  { name: "Paternity Leave", daysPerYear: 15, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "Yes", status: "Active" },
  { name: "Unpaid Leave", daysPerYear: 0, carryForward: "No", paidUnpaid: "Unpaid", approvalRequired: "Yes", status: "Active" },
  { name: "Comp Off", daysPerYear: 0, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "Yes", status: "Active" },
  { name: "Optional Holiday", daysPerYear: 3, carryForward: "No", paidUnpaid: "Paid", approvalRequired: "No", status: "Active" }
];

const leaveRequests = [
  { id: "LR-2201", employee: "Aarav Sharma", avatar: demoUsers.employee.avatar, type: "Casual Leave", from: "2026-09-22", to: "2026-09-23", days: 2, reason: "Personal work", appliedOn: "2026-09-18", status: "Pending" },
  { id: "LR-2202", employee: "Manish Agarwal", avatar: "https://randomuser.me/api/portraits/men/38.jpg", type: "Sick Leave", from: "2026-09-17", to: "2026-09-19", days: 3, reason: "Fever and viral infection", appliedOn: "2026-09-16", status: "Approved" },
  { id: "LR-2203", employee: "Ritu Chawla", avatar: "https://randomuser.me/api/portraits/women/71.jpg", type: "Annual Leave", from: "2026-10-02", to: "2026-10-06", days: 5, reason: "Family function", appliedOn: "2026-09-14", status: "Pending" },
  { id: "LR-2204", employee: "Rohan Mehta", avatar: "https://randomuser.me/api/portraits/men/22.jpg", type: "Casual Leave", from: "2026-09-10", to: "2026-09-10", days: 1, reason: "Bank work", appliedOn: "2026-09-08", status: "Approved" },
  { id: "LR-2205", employee: "Neha Kapoor", avatar: "https://randomuser.me/api/portraits/women/33.jpg", type: "Sick Leave", from: "2026-09-05", to: "2026-09-05", days: 1, reason: "Not feeling well", appliedOn: "2026-09-05", status: "Rejected" },
  { id: "LR-2206", employee: "Suresh Yadav", avatar: "https://randomuser.me/api/portraits/men/49.jpg", type: "Comp Off", from: "2026-09-25", to: "2026-09-25", days: 1, reason: "Worked on last Sunday's deployment", appliedOn: "2026-09-19", status: "Pending" },
  { id: "LR-2207", employee: "Sneha Iyer", avatar: "https://randomuser.me/api/portraits/women/56.jpg", type: "Annual Leave", from: "2026-08-20", to: "2026-08-22", days: 3, reason: "Travel", appliedOn: "2026-08-10", status: "Approved" }
];

const leaveBalance = { annual: { total: 18, used: 6, remaining: 12 }, casual: { total: 12, used: 5, remaining: 7 }, sick: { total: 10, used: 2, remaining: 8 }, earned: { total: 6, used: 0, remaining: 6 } };

const holidays = [
  { date: "2026-01-26", day: "Monday", name: "Republic Day", type: "Public Holiday", location: "All Offices" },
  { date: "2026-03-06", day: "Friday", name: "Holi", type: "Public Holiday", location: "All Offices" },
  { date: "2026-04-14", day: "Tuesday", name: "Ambedkar Jayanti", type: "Optional Holiday", location: "All Offices" },
  { date: "2026-08-15", day: "Saturday", name: "Independence Day", type: "Public Holiday", location: "All Offices" },
  { date: "2026-09-19", day: "Saturday", name: "Ganesh Chaturthi", type: "Public Holiday", location: "Bengaluru HQ" },
  { date: "2026-10-02", day: "Friday", name: "Gandhi Jayanti", type: "Public Holiday", location: "All Offices" },
  { date: "2026-10-20", day: "Tuesday", name: "Diwali", type: "Public Holiday", location: "All Offices" },
  { date: "2026-12-25", day: "Friday", name: "Christmas", type: "Company Holiday", location: "All Offices" }
];

/* ---------------------------------------------------------------------- */
/* PAYROLL                                                                  */
/* ---------------------------------------------------------------------- */

const payrollRuns = employees.map(e => ({
  employeeId: e.id, name: e.name, avatar: e.avatar, department: e.department,
  basic: e.basic, hra: e.hra, allowances: e.allowances, gross: e.gross,
  deductions: e.deductions, tax: e.tax, bonus: e.bonus, net: e.net,
  status: e.status === "Probation" ? "Pending" : (e.id === "EMP017" ? "On Hold" : "Processed")
}));

const payrollSummary = {
  totalEmployees: employees.length,
  grossPayroll: payrollRuns.reduce((s, p) => s + p.gross, 0),
  netPayroll: payrollRuns.reduce((s, p) => s + p.net, 0),
  totalDeductions: payrollRuns.reduce((s, p) => s + p.deductions, 0),
  totalTax: payrollRuns.reduce((s, p) => s + p.tax, 0),
  totalBonus: payrollRuns.reduce((s, p) => s + p.bonus, 0),
  pending: payrollRuns.filter(p => p.status !== "Processed").length
};

const monthlyPayrollTrend = [
  { month: "Apr", amount: 2185000 }, { month: "May", amount: 2201000 }, { month: "Jun", amount: 2240000 },
  { month: "Jul", amount: 2266000 }, { month: "Aug", amount: 2298000 }, { month: "Sep", amount: 2334000 }
];

const salaryComponents = [
  { name: "Basic Salary", type: "Earning", calc: "50% of CTC" },
  { name: "HRA", type: "Earning", calc: "40% of Basic" },
  { name: "Conveyance Allowance", type: "Earning", calc: "Fixed ₹1,600/month" },
  { name: "Medical Allowance", type: "Earning", calc: "Fixed ₹1,250/month" },
  { name: "Special Allowance", type: "Earning", calc: "Balancing figure" },
  { name: "Performance Bonus", type: "Earning", calc: "Variable, up to 15% of Basic" },
  { name: "Provident Fund (PF)", type: "Deduction", calc: "12% of Basic" },
  { name: "Professional Tax", type: "Deduction", calc: "Fixed ₹200/month" },
  { name: "Income Tax (TDS)", type: "Deduction", calc: "As per slab" },
  { name: "Other Deductions", type: "Deduction", calc: "As applicable" }
];

/* ---------------------------------------------------------------------- */
/* RECRUITMENT                                                             */
/* ---------------------------------------------------------------------- */

const jobs = [
  { id: "JOB-101", title: "Senior Backend Engineer", department: "Engineering", location: "Bengaluru HQ", employmentType: "Full-Time", experience: "5–8 years", applicants: 34, postedDate: "2026-08-20", deadline: "2026-10-10", status: "Open", salaryRange: "₹18L – ₹26L", description: "Own the design and scaling of our core services layer.", responsibilities: ["Design scalable APIs", "Mentor junior engineers", "Own service reliability"], requirements: ["5+ yrs backend experience", "Strong in Node.js/Java", "Experience with distributed systems"], skills: ["Node.js", "PostgreSQL", "AWS", "Kafka"], benefits: ["Health insurance", "ESOPs", "Flexible hours"] },
  { id: "JOB-102", title: "Product Designer", department: "Engineering", location: "Remote", employmentType: "Full-Time", experience: "3–5 years", applicants: 51, postedDate: "2026-08-28", deadline: "2026-10-05", status: "Open", salaryRange: "₹14L – ₹20L", description: "Shape the end-to-end design of our HR product suite.", responsibilities: ["Own design systems", "Run user research", "Prototype new flows"], requirements: ["Portfolio required", "Figma expertise", "SaaS experience preferred"], skills: ["Figma", "Design Systems", "User Research"], benefits: ["Health insurance", "Remote stipend"] },
  { id: "JOB-103", title: "HR Business Partner", department: "Human Resources", location: "Bengaluru HQ", employmentType: "Full-Time", experience: "4–6 years", applicants: 19, postedDate: "2026-09-01", deadline: "2026-10-15", status: "Open", salaryRange: "₹12L – ₹16L", description: "Partner with engineering leadership on people strategy.", responsibilities: ["Employee relations", "Performance calibration", "Policy design"], requirements: ["MBA HR preferred", "4+ yrs HRBP experience"], skills: ["Employee Relations", "HRIS", "Coaching"], benefits: ["Health insurance", "Wellness budget"] },
  { id: "JOB-104", title: "Sales Development Representative", department: "Sales", location: "Mumbai Office", employmentType: "Full-Time", experience: "1–3 years", applicants: 62, postedDate: "2026-07-15", deadline: "2026-09-15", status: "Paused", salaryRange: "₹6L – ₹9L", description: "Generate and qualify pipeline for the enterprise sales team.", responsibilities: ["Outbound prospecting", "Lead qualification", "CRM hygiene"], requirements: ["1+ yrs SDR experience", "Excellent communication"], skills: ["CRM", "Cold Outreach", "Negotiation"], benefits: ["Commission", "Health insurance"] },
  { id: "JOB-105", title: "DevOps Engineer", department: "Engineering", location: "Bengaluru HQ", employmentType: "Full-Time", experience: "3–6 years", applicants: 28, postedDate: "2026-09-05", deadline: "2026-10-20", status: "Open", salaryRange: "₹16L – ₹22L", description: "Build and scale our cloud infrastructure and CI/CD pipelines.", responsibilities: ["Manage AWS infra", "Improve CI/CD", "On-call reliability"], requirements: ["3+ yrs DevOps", "Kubernetes experience"], skills: ["AWS", "Kubernetes", "Terraform"], benefits: ["Health insurance", "ESOPs"] },
  { id: "JOB-106", title: "Content Marketing Manager", department: "Marketing", location: "Remote", employmentType: "Contract", experience: "2–4 years", applicants: 15, postedDate: "2026-06-10", deadline: "2026-08-01", status: "Closed", salaryRange: "₹9L – ₹12L", description: "Own our content calendar and organic growth strategy.", responsibilities: ["Content strategy", "SEO", "Editorial calendar"], requirements: ["2+ yrs content marketing", "SEO fundamentals"], skills: ["SEO", "Content Strategy", "Analytics"], benefits: ["Flexible hours"] }
];

const candidates = [
  { name: "Ishaan Kapoor", position: "Senior Backend Engineer", experience: "6 years", location: "Bengaluru", appliedDate: "2026-09-10", stage: "Interview", rating: 4, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/men/18.jpg", email: "ishaan.k@mail.com", phone: "+91 90000 11111" },
  { name: "Kritika Rao", position: "Product Designer", experience: "4 years", location: "Pune", appliedDate: "2026-09-08", stage: "Technical", rating: 5, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/women/18.jpg", email: "kritika.r@mail.com", phone: "+91 90000 11112" },
  { name: "Farhan Ali", position: "HR Business Partner", experience: "5 years", location: "Bengaluru", appliedDate: "2026-09-05", stage: "HR Round", rating: 4, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/men/26.jpg", email: "farhan.ali@mail.com", phone: "+91 90000 11113" },
  { name: "Sanya Malhotra", position: "Senior Backend Engineer", experience: "7 years", location: "Hyderabad", appliedDate: "2026-09-12", stage: "Screening", rating: 3, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/women/24.jpg", email: "sanya.m@mail.com", phone: "+91 90000 11114" },
  { name: "Devraj Singh", position: "DevOps Engineer", experience: "4 years", location: "Bengaluru", appliedDate: "2026-09-14", stage: "Applied", rating: 0, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/men/29.jpg", email: "devraj.s@mail.com", phone: "+91 90000 11115" },
  { name: "Ayesha Khan", position: "Product Designer", experience: "3 years", location: "Remote", appliedDate: "2026-09-02", stage: "Selected", rating: 5, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/women/12.jpg", email: "ayesha.k@mail.com", phone: "+91 90000 11116" },
  { name: "Nikhil Chandra", position: "Sales Development Representative", experience: "2 years", location: "Mumbai", appliedDate: "2026-08-20", stage: "Rejected", rating: 2, recruiter: "Gaurav Kapoor", avatar: "https://randomuser.me/api/portraits/men/64.jpg", email: "nikhil.c@mail.com", phone: "+91 90000 11117" },
  { name: "Simran Kaur", position: "Senior Backend Engineer", experience: "5 years", location: "Bengaluru", appliedDate: "2026-09-16", stage: "Offer", rating: 5, recruiter: "Pooja Desai", avatar: "https://randomuser.me/api/portraits/women/16.jpg", email: "simran.kaur@mail.com", phone: "+91 90000 11118" }
];

const interviews = [
  { candidate: "Ishaan Kapoor", position: "Senior Backend Engineer", interviewer: "Kavita Joshi", date: "2026-09-22", time: "11:00 AM", type: "Technical", location: "Google Meet", status: "Scheduled" },
  { candidate: "Kritika Rao", position: "Product Designer", interviewer: "Deepika Rao", date: "2026-09-21", time: "03:00 PM", type: "Video", location: "Zoom", status: "Scheduled" },
  { candidate: "Farhan Ali", position: "HR Business Partner", interviewer: "Anjali Nair", date: "2026-09-20", time: "10:30 AM", type: "HR", location: "Bengaluru HQ - Room 3", status: "Completed" },
  { candidate: "Simran Kaur", position: "Senior Backend Engineer", interviewer: "Rahul Verma", date: "2026-09-17", time: "02:00 PM", type: "Final", location: "Google Meet", status: "Completed" },
  { candidate: "Sanya Malhotra", position: "Senior Backend Engineer", interviewer: "Rohan Mehta", date: "2026-09-24", time: "04:00 PM", type: "Phone", location: "Phone Call", status: "Scheduled" }
];

const offers = [
  { candidate: "Simran Kaur", position: "Senior Backend Engineer", salary: "₹24,00,000", offerDate: "2026-09-18", joiningDate: "2026-10-15", status: "Sent" },
  { candidate: "Ayesha Khan", position: "Product Designer", salary: "₹18,50,000", offerDate: "2026-09-05", joiningDate: "2026-10-01", status: "Accepted" }
];

const recruitmentSummary = { openPositions: jobs.filter(j => j.status === "Open").length, totalCandidates: candidates.length, interviews: interviews.filter(i => i.status === "Scheduled").length, offers: offers.length, hired: 3, rejected: candidates.filter(c => c.stage === "Rejected").length };
const funnelData = [ { label: "Applied", value: 210 }, { label: "Screening", value: 122 }, { label: "Interview", value: 58 }, { label: "Shortlisted", value: 24 }, { label: "Offer", value: 9 }, { label: "Hired", value: 6 } ];

/* ---------------------------------------------------------------------- */
/* ONBOARDING                                                              */
/* ---------------------------------------------------------------------- */

const onboardingChecklist = ["Offer Letter Signed", "ID Verification", "Bank Details Submitted", "Documents Uploaded", "System Access Granted", "Email Account Created", "Laptop Issued", "ID Card Issued", "Team Introduction", "Policy Acceptance"];

const newJoiners = [
  { name: "Tanvi Shah", designation: "Junior Developer", department: "Engineering", joiningDate: "2026-07-01", avatar: "https://randomuser.me/api/portraits/women/12.jpg", completed: ["Offer Letter Signed", "ID Verification", "Bank Details Submitted", "Documents Uploaded", "Email Account Created", "Laptop Issued", "Team Introduction"], progress: 70 },
  { name: "Devraj Singh", designation: "DevOps Engineer (Incoming)", department: "Engineering", joiningDate: "2026-10-06", avatar: "https://randomuser.me/api/portraits/men/29.jpg", completed: ["Offer Letter Signed", "ID Verification"], progress: 20 },
  { name: "Ayesha Khan", designation: "Product Designer (Incoming)", department: "Engineering", joiningDate: "2026-10-01", avatar: "https://randomuser.me/api/portraits/women/12.jpg", completed: ["Offer Letter Signed", "ID Verification", "Bank Details Submitted", "Documents Uploaded"], progress: 40 }
];

/* ---------------------------------------------------------------------- */
/* PERFORMANCE                                                             */
/* ---------------------------------------------------------------------- */

const goals = [
  { goal: "Ship v2 of onboarding flow", employee: "Aarav Sharma", department: "Engineering", startDate: "2026-07-01", dueDate: "2026-09-30", progress: 80, status: "In Progress" },
  { goal: "Reduce API latency by 30%", employee: "Aditya Kumar", department: "Engineering", startDate: "2026-06-15", dueDate: "2026-09-15", progress: 100, status: "Completed" },
  { goal: "Hire 4 backend engineers", employee: "Pooja Desai", department: "Human Resources", startDate: "2026-08-01", dueDate: "2026-11-30", progress: 45, status: "In Progress" },
  { goal: "Launch employee wellness program", employee: "Anjali Nair", department: "Human Resources", startDate: "2026-07-01", dueDate: "2026-09-10", progress: 60, status: "Overdue" },
  { goal: "Complete design system rollout", employee: "Sneha Iyer", department: "Engineering", startDate: "2026-05-01", dueDate: "2026-08-31", progress: 100, status: "Completed" },
  { goal: "Improve NPS by 10 points", employee: "Divya Menon", department: "Customer Support", startDate: "2026-07-01", dueDate: "2026-10-31", progress: 25, status: "Not Started" }
];

const reviews = [
  { employee: "Aarav Sharma", department: "Engineering", reviewPeriod: "H1 2026", goalsCount: 4, completion: 88, rating: 4.4, status: "Completed",
    strengths: "Strong ownership of the onboarding revamp; reliable delivery under pressure.", developmentAreas: "Could delegate more to junior engineers on the team.",
    managerFeedback: "Aarav consistently exceeds expectations on delivery and code quality. Ready for more scope.", employeeFeedback: "Would like more opportunities to mentor and lead design discussions.", finalRating: "Exceeds Expectations" },
  { employee: "Rohan Mehta", department: "Engineering", reviewPeriod: "H1 2026", goalsCount: 3, completion: 72, rating: 3.8, status: "Completed",
    strengths: "Fast learner, picked up the payments module quickly.", developmentAreas: "Needs to improve test coverage on new features.",
    managerFeedback: "Solid progress this half. Focus on writing tests alongside features next cycle.", employeeFeedback: "Enjoying the backend work, want to explore infra next.", finalRating: "Meets Expectations" },
  { employee: "Neha Kapoor", department: "Marketing", reviewPeriod: "H1 2026", goalsCount: 2, completion: 40, rating: 0, status: "Pending",
    strengths: "", developmentAreas: "", managerFeedback: "", employeeFeedback: "", finalRating: "" },
  { employee: "Karan Malhotra", department: "Sales", reviewPeriod: "H1 2026", goalsCount: 3, completion: 55, rating: 0, status: "Pending",
    strengths: "", developmentAreas: "", managerFeedback: "", employeeFeedback: "", finalRating: "" }
];

/* ---------------------------------------------------------------------- */
/* EXPENSES                                                                 */
/* ---------------------------------------------------------------------- */

const expenseCategories = ["Travel", "Food", "Accommodation", "Internet", "Office Supplies", "Transportation", "Client Meeting", "Other"];

const expenses = [
  { id: "EXP-3301", employee: "Aarav Sharma", avatar: demoUsers.employee.avatar, category: "Travel", date: "2026-09-10", amount: 4200, description: "Client visit - flight to Mumbai", receipt: "flight_receipt.pdf", status: "Approved" },
  { id: "EXP-3302", employee: "Aarav Sharma", avatar: demoUsers.employee.avatar, category: "Internet", date: "2026-09-01", amount: 1200, description: "Monthly WFH internet reimbursement", receipt: "internet_bill.pdf", status: "Pending" },
  { id: "EXP-3303", employee: "Karan Malhotra", avatar: "https://randomuser.me/api/portraits/men/12.jpg", category: "Client Meeting", date: "2026-09-12", amount: 2600, description: "Lunch with prospective client", receipt: "lunch_receipt.jpg", status: "Approved" },
  { id: "EXP-3304", employee: "Sneha Iyer", avatar: "https://randomuser.me/api/portraits/women/56.jpg", category: "Office Supplies", date: "2026-09-08", amount: 850, description: "Design tablet stylus replacement", receipt: "stylus_invoice.pdf", status: "Rejected" },
  { id: "EXP-3305", employee: "Gaurav Kapoor", avatar: "https://randomuser.me/api/portraits/men/67.jpg", category: "Travel", date: "2026-09-14", amount: 8900, description: "Client site visit - Pune", receipt: "travel_receipt.pdf", status: "Reimbursed" },
  { id: "EXP-3306", employee: "Aditya Kumar", avatar: "https://randomuser.me/api/portraits/men/45.jpg", category: "Accommodation", date: "2026-09-05", amount: 3400, description: "Hotel stay - conference", receipt: "hotel_invoice.pdf", status: "Approved" },
  { id: "EXP-3307", employee: "Ritu Chawla", avatar: "https://randomuser.me/api/portraits/women/71.jpg", category: "Transportation", date: "2026-09-16", amount: 650, description: "Cab fare to client office", receipt: "cab_receipt.jpg", status: "Pending" }
];

const expenseSummary = { total: expenses.reduce((s, e) => s + e.amount, 0), pending: expenses.filter(e => e.status === "Pending").reduce((s, e) => s + e.amount, 0), approved: expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.amount, 0), reimbursed: expenses.filter(e => e.status === "Reimbursed").reduce((s, e) => s + e.amount, 0) };

/* ---------------------------------------------------------------------- */
/* ASSETS                                                                   */
/* ---------------------------------------------------------------------- */

const assetCategories = ["Laptop", "Desktop", "Monitor", "Mobile", "Tablet", "Headset", "Keyboard", "Mouse", "Access Card", "Software License"];

const assets = [
  { assetId: "AST-1001", name: "MacBook Pro 14\"", category: "Laptop", serialNumber: "C02F8912XYZ", assignedTo: "Aarav Sharma", assignedDate: "2021-03-15", condition: "Good", status: "Assigned" },
  { assetId: "AST-1002", name: "Dell UltraSharp 27\"", category: "Monitor", serialNumber: "DU27-88213", assignedTo: "Aarav Sharma", assignedDate: "2021-03-15", condition: "Good", status: "Assigned" },
  { assetId: "AST-1003", name: "MacBook Air M2", category: "Laptop", serialNumber: "C02G7734ABC", assignedTo: "Sneha Iyer", assignedDate: "2022-09-19", condition: "Good", status: "Assigned" },
  { assetId: "AST-1004", name: "iPhone 14", category: "Mobile", serialNumber: "IMEI99213344", assignedTo: "Gaurav Kapoor", assignedDate: "2023-01-10", condition: "Fair", status: "Assigned" },
  { assetId: "AST-1005", name: "ThinkPad X1 Carbon", category: "Laptop", serialNumber: "PF3928KX", assignedTo: null, assignedDate: null, condition: "Good", status: "Available" },
  { assetId: "AST-1006", name: "Jabra Evolve 65", category: "Headset", serialNumber: "JB65-44521", assignedTo: "Divya Menon", assignedDate: "2019-03-11", condition: "Fair", status: "Assigned" },
  { assetId: "AST-1007", name: "Logitech MX Master 3", category: "Mouse", serialNumber: "MX3-77821", assignedTo: null, assignedDate: null, condition: "Good", status: "Under Repair" },
  { assetId: "AST-1008", name: "Adobe Creative Cloud", category: "Software License", serialNumber: "ACC-2026-441", assignedTo: "Sneha Iyer", assignedDate: "2022-09-19", condition: "N/A", status: "Assigned" },
  { assetId: "AST-1009", name: "HQ Access Card #221", category: "Access Card", serialNumber: "AC-221", assignedTo: "Rahul Verma", assignedDate: "2019-12-02", condition: "Good", status: "Assigned" },
  { assetId: "AST-1010", name: "Dell Latitude 5420", category: "Laptop", serialNumber: "DL5420-8891", assignedTo: null, assignedDate: null, condition: "Retired", status: "Retired" }
];

const assetSummary = { total: assets.length, assigned: assets.filter(a => a.status === "Assigned").length, available: assets.filter(a => a.status === "Available").length, underRepair: assets.filter(a => a.status === "Under Repair").length, retired: assets.filter(a => a.status === "Retired").length };

/* ---------------------------------------------------------------------- */
/* DOCUMENTS                                                                */
/* ---------------------------------------------------------------------- */

const documents = [
  { name: "Aarav Sharma - Offer Letter.pdf", category: "Employee Documents", owner: "Aarav Sharma", uploadedDate: "2021-03-10", expiryDate: "—", status: "Verified" },
  { name: "Employee Handbook 2026.pdf", category: "Policies", owner: "HR Team", uploadedDate: "2026-01-05", expiryDate: "—", status: "Published" },
  { name: "Vendor Contract - CloudServe.pdf", category: "Contracts", owner: "Sanjay Gupta", uploadedDate: "2025-11-20", expiryDate: "2027-11-20", status: "Active" },
  { name: "Priya Patel - PAN Card.pdf", category: "Employee Documents", owner: "Priya Patel", uploadedDate: "2022-01-08", expiryDate: "—", status: "Verified" },
  { name: "Leave Policy v3.pdf", category: "Policies", owner: "HR Team", uploadedDate: "2025-06-15", expiryDate: "—", status: "Published" },
  { name: "September Payroll Register.xlsx", category: "Payroll Documents", owner: "Vikram Singh", uploadedDate: "2026-09-19", expiryDate: "—", status: "Draft" },
  { name: "Office Lease Agreement - Bengaluru.pdf", category: "Company Documents", owner: "Sanjay Gupta", uploadedDate: "2024-04-01", expiryDate: "2027-04-01", status: "Active" },
  { name: "Rohan Mehta - Resume.pdf", category: "Employee Documents", owner: "Rohan Mehta", uploadedDate: "2022-05-20", expiryDate: "—", status: "Verified" },
  { name: "ISO 27001 Certificate.pdf", category: "Company Documents", owner: "Sanjay Gupta", uploadedDate: "2025-09-01", expiryDate: "2028-09-01", status: "Active" }
];

/* ---------------------------------------------------------------------- */
/* ANNOUNCEMENTS, EVENTS, BIRTHDAYS                                         */
/* ---------------------------------------------------------------------- */

const announcements = [
  { title: "Ganesh Chaturthi Holiday Notice", description: "Office will remain closed on 19th September for Ganesh Chaturthi. Wishing everyone a joyful celebration.", author: "Anjali Nair", publishedDate: "2026-09-15", audience: "Everyone", status: "Published" },
  { title: "New Payroll Cycle Dates", description: "Starting October, payroll will be processed on the 28th of every month instead of the 30th.", author: "Vikram Singh", publishedDate: "2026-09-12", audience: "Everyone", status: "Published" },
  { title: "Q3 All-Hands Meeting", description: "Join us for the quarterly all-hands on 30th September at 4 PM in the main auditorium.", author: "Amitabh Sinha", publishedDate: "2026-09-10", audience: "Everyone", status: "Published" },
  { title: "Engineering On-call Rotation Update", description: "The new on-call rotation schedule for Q4 has been shared in the engineering wiki.", author: "Kavita Joshi", publishedDate: "2026-09-08", audience: "Engineering", status: "Published" },
  { title: "Wellness Program Launch — Draft", description: "Details of the new employee wellness program, pending final review before publishing.", author: "Anjali Nair", publishedDate: "2026-09-19", audience: "Everyone", status: "Draft" }
];

const events = [
  { name: "Q3 All-Hands Meeting", date: "2026-09-30", time: "04:00 PM", location: "Main Auditorium, Bengaluru HQ", organizer: "Amitabh Sinha", participants: 240, status: "Upcoming" },
  { name: "Engineering Hackathon", date: "2026-10-11", time: "09:00 AM", location: "Bengaluru HQ", organizer: "Kavita Joshi", participants: 45, status: "Upcoming" },
  { name: "Diwali Celebration", date: "2026-10-19", time: "05:30 PM", location: "All Offices", organizer: "Anjali Nair", participants: 300, status: "Upcoming" },
  { name: "New Hire Orientation - Batch 12", date: "2026-08-22", time: "10:00 AM", location: "Bengaluru HQ", organizer: "Pooja Desai", participants: 8, status: "Completed" }
];

const birthdaysToday = employees.filter((e, i) => i === 3 || i === 17).map(e => ({ name: e.name, avatar: e.avatar, designation: e.designation }));
const upcomingBirthdays = [
  { name: "Rohan Mehta", avatar: "https://randomuser.me/api/portraits/men/22.jpg", date: "Nov 2" },
  { name: "Meera Pillai", avatar: "https://randomuser.me/api/portraits/women/50.jpg", date: "Oct 11" },
  { name: "Suresh Yadav", avatar: "https://randomuser.me/api/portraits/men/49.jpg", date: "Jan 19" }
];
const workAnniversaries = [
  { name: "Aarav Sharma", avatar: demoUsers.employee.avatar, years: 5, date: "Mar 14" },
  { name: "Rahul Verma", avatar: "https://randomuser.me/api/portraits/men/54.jpg", years: 6, date: "Dec 2" }
];

/* ---------------------------------------------------------------------- */
/* TASKS, TIMESHEET, WFH, TRAVEL                                            */
/* ---------------------------------------------------------------------- */

const tasks = [
  { task: "Finalize onboarding flow copy", assignedTo: "Aarav Sharma", priority: "High", dueDate: "2026-09-22", progress: 70, status: "In Progress" },
  { task: "Fix payslip PDF export bug", assignedTo: "Aarav Sharma", priority: "Urgent", dueDate: "2026-09-20", progress: 40, status: "In Progress" },
  { task: "Review Q3 hiring plan", assignedTo: "Anjali Nair", priority: "Medium", dueDate: "2026-09-25", progress: 0, status: "Todo" },
  { task: "Update leave policy document", assignedTo: "Priya Patel", priority: "Low", dueDate: "2026-09-28", progress: 100, status: "Completed" },
  { task: "Prepare payroll register for review", assignedTo: "Vikram Singh", priority: "High", dueDate: "2026-09-21", progress: 85, status: "Review" },
  { task: "Design new KPI card variants", assignedTo: "Sneha Iyer", priority: "Medium", dueDate: "2026-09-24", progress: 55, status: "In Progress" }
];

const timesheetWeek = {
  weekLabel: "15 – 21 Sep 2026",
  entries: [
    { date: "2026-09-15", day: "Mon", project: "HRM Platform", task: "Onboarding revamp", startTime: "09:30 AM", endTime: "06:30 PM", totalHours: "8h 30m", status: "Approved" },
    { date: "2026-09-16", day: "Tue", project: "HRM Platform", task: "Payslip PDF export", startTime: "09:40 AM", endTime: "06:45 PM", totalHours: "8h 20m", status: "Approved" },
    { date: "2026-09-17", day: "Wed", project: "HRM Platform", task: "Code review + bug fixes", startTime: "09:25 AM", endTime: "06:15 PM", totalHours: "8h 15m", status: "Approved" },
    { date: "2026-09-18", day: "Thu", project: "Internal Tools", task: "Sprint planning + dev", startTime: "09:35 AM", endTime: "07:00 PM", totalHours: "8h 45m", status: "Submitted" },
    { date: "2026-09-19", day: "Fri", project: "HRM Platform", task: "Onboarding flow copy", startTime: "09:30 AM", endTime: "05:30 PM", totalHours: "7h 30m", status: "Draft" }
  ],
  total: "41h 20m"
};

const wfhRequests = [
  { employee: "Aarav Sharma", date: "2026-09-25", reason: "Internet installation at new residence", workLocation: "Home - Bengaluru", manager: "Kavita Joshi", status: "Pending" },
  { employee: "Sneha Iyer", date: "2026-09-05", reason: "Focused design work", workLocation: "Home - Pune", manager: "Kavita Joshi", status: "Approved" },
  { employee: "Aditya Kumar", date: "2026-09-12", reason: "Personal errand nearby", workLocation: "Home - Hyderabad", manager: "Kavita Joshi", status: "Approved" }
];

const travelRequests = [
  { employee: "Karan Malhotra", destination: "Mumbai", travelDate: "2026-09-25", returnDate: "2026-09-27", purpose: "Client meeting - Q4 renewal", estimatedCost: 12500, accommodation: "Yes", transportation: "Flight", stage: "HR / Finance", status: "Pending" },
  { employee: "Gaurav Kapoor", destination: "Pune", travelDate: "2026-09-14", returnDate: "2026-09-15", purpose: "Site visit", estimatedCost: 8900, accommodation: "Yes", transportation: "Train", stage: "Approved", status: "Approved" }
];

/* ---------------------------------------------------------------------- */
/* NOTIFICATIONS                                                            */
/* ---------------------------------------------------------------------- */

const notifications = [
  { type: "Leave Approval", message: "Manish Agarwal's sick leave request needs your approval.", time: "10 min ago", read: false, icon: "bi-calendar-check", tint: "warning" },
  { type: "Payroll", message: "September payroll processing completed for 22 employees.", time: "1 hr ago", read: false, icon: "bi-cash-coin", tint: "success" },
  { type: "Announcement", message: "New company announcement: Q3 All-Hands Meeting.", time: "3 hrs ago", read: false, icon: "bi-megaphone", tint: "info" },
  { type: "Performance", message: "Your H1 2026 performance review is due for submission.", time: "1 day ago", read: true, icon: "bi-graph-up-arrow", tint: "brand" },
  { type: "Attendance", message: "You were marked late today at 10:12 AM.", time: "2 days ago", read: true, icon: "bi-clock-history", tint: "danger" },
  { type: "Task", message: "New task assigned: Fix payslip PDF export bug.", time: "2 days ago", read: true, icon: "bi-list-check", tint: "info" }
];

/* ---------------------------------------------------------------------- */
/* USERS, AUDIT LOG, PERMISSION MATRIX                                      */
/* ---------------------------------------------------------------------- */

const systemUsers = [
  { name: "Amitabh Sinha", role: "super_admin", employeeId: "EMP021", email: "amitabh.sinha@nimbushr.com", lastLogin: "2026-09-19 09:02 AM", status: "Active" },
  { name: "Sanjay Gupta", role: "admin", employeeId: "EMP015", email: "sanjay.gupta@nimbushr.com", lastLogin: "2026-09-19 08:47 AM", status: "Active" },
  { name: "Anjali Nair", role: "hr_manager", employeeId: "EMP006", email: "anjali.nair@nimbushr.com", lastLogin: "2026-09-19 09:15 AM", status: "Active" },
  { name: "Priya Patel", role: "hr_executive", employeeId: "EMP002", email: "priya.patel@nimbushr.com", lastLogin: "2026-09-18 06:40 PM", status: "Active" },
  { name: "Vikram Singh", role: "payroll_manager", employeeId: "EMP005", email: "vikram.singh@nimbushr.com", lastLogin: "2026-09-19 09:30 AM", status: "Active" },
  { name: "Kavita Joshi", role: "manager", employeeId: "EMP010", email: "kavita.joshi@nimbushr.com", lastLogin: "2026-09-19 08:55 AM", status: "Active" },
  { name: "Rahul Verma", role: "team_lead", employeeId: "EMP011", email: "rahul.verma@nimbushr.com", lastLogin: "2026-09-18 07:10 PM", status: "Active" },
  { name: "Aarav Sharma", role: "employee", employeeId: "EMP001", email: "aarav.sharma@nimbushr.com", lastLogin: "2026-09-19 09:24 AM", status: "Active" },
  { name: "Manish Agarwal", role: "employee", employeeId: "EMP017", email: "manish.agarwal@nimbushr.com", lastLogin: "2026-09-12 11:05 AM", status: "Inactive" }
];

const permissionModules = ["Employees", "Attendance", "Leave", "Payroll", "Recruitment", "Performance", "Expenses", "Assets", "Documents", "Reports", "Settings"];
function buildPermissionMatrix(role) {
  const p = permissions[role] || [];
  const check = (...keys) => keys.some(k => p.includes(k));
  return [
    { module: "Employees", view: check("view_employees", "view_directory"), create: check("manage_employees"), edit: check("manage_employees", "edit_employees"), del: check("manage_employees") && role !== "hr_executive", approve: check("manage_employees") },
    { module: "Attendance", view: check("view_attendance"), create: check("manage_employees", "manage_settings"), edit: check("manage_employees", "manage_settings"), del: role === "super_admin", approve: check("view_team_attendance", "manage_leave") },
    { module: "Leave", view: check("apply_leave", "manage_leave"), create: check("apply_leave"), edit: check("manage_leave"), del: role === "super_admin", approve: check("manage_leave", "approve_team_leave") },
    { module: "Payroll", view: check("view_payroll", "view_payslip"), create: check("process_payroll"), edit: check("manage_salary"), del: role === "super_admin", approve: check("process_payroll") },
    { module: "Recruitment", view: check("manage_recruitment"), create: check("manage_recruitment"), edit: check("manage_recruitment"), del: check("manage_recruitment") && role !== "hr_executive", approve: check("manage_recruitment") },
    { module: "Performance", view: check("manage_performance", "review_performance"), create: check("manage_performance"), edit: check("manage_performance", "review_performance"), del: role === "super_admin", approve: check("manage_performance") },
    { module: "Expenses", view: check("submit_expense"), create: check("submit_expense"), edit: role === "super_admin" || role === "admin", del: role === "super_admin", approve: check("approve_team_leave", "manage_employees") },
    { module: "Assets", view: check("view_assets", "manage_assets"), create: check("manage_assets"), edit: check("manage_assets"), del: check("manage_assets"), approve: check("manage_assets") },
    { module: "Documents", view: check("view_documents", "manage_documents"), create: check("manage_documents"), edit: check("manage_documents"), del: role === "super_admin", approve: false },
    { module: "Reports", view: check("view_reports"), create: false, edit: false, del: false, approve: false },
    { module: "Settings", view: check("manage_settings"), create: check("manage_settings"), edit: check("manage_settings"), del: role === "super_admin", approve: role === "super_admin" }
  ];
}

const auditLogs = [
  { user: "Sanjay Gupta", action: "Updated Employee", module: "Employee Management", description: "Updated salary information for EMP012", ip: "10.20.4.12", date: "2026-09-19", time: "10:42 AM", status: "Success" },
  { user: "Anjali Nair", action: "Approved Leave", module: "Leave Management", description: "Approved casual leave for Rohan Mehta", ip: "10.20.4.19", date: "2026-09-19", time: "09:58 AM", status: "Success" },
  { user: "Vikram Singh", action: "Processed Payroll", module: "Payroll", description: "Ran September payroll for 22 employees", ip: "10.20.4.31", date: "2026-09-19", time: "09:10 AM", status: "Success" },
  { user: "Amitabh Sinha", action: "Updated Role", module: "User Management", description: "Changed Pooja Desai's access level", ip: "10.20.4.02", date: "2026-09-18", time: "05:22 PM", status: "Success" },
  { user: "Priya Patel", action: "Rejected Leave", module: "Leave Management", description: "Rejected sick leave for Neha Kapoor", ip: "10.20.4.19", date: "2026-09-18", time: "02:14 PM", status: "Success" },
  { user: "Unknown", action: "Failed Login", module: "Authentication", description: "3 failed login attempts for admin@nimbushr.com", ip: "203.0.113.5", date: "2026-09-17", time: "11:47 PM", status: "Warning" }
];

/* ---------------------------------------------------------------------- */
/* NAVIGATION CONFIG                                                        */
/* ---------------------------------------------------------------------- */

const navigation = [
  { group: "Main", items: [
    { title: "Dashboard", icon: "bi-grid-1x2", href: "dashboard.html", roles: ["all"] }
  ]},
  { group: "Workspace", items: [
    { title: "My Profile", icon: "bi-person-badge", href: "employee-profile.html", roles: ["all"] },
    { title: "Tasks & Timesheet", icon: "bi-list-check", href: "productivity.html", roles: ["all"] },
    { title: "My Attendance", icon: "bi-fingerprint", href: "attendance.html", roles: ["all"] },
    { title: "My Leave", icon: "bi-calendar2-week", href: "leave.html", roles: ["all"] }
  ]},
  { group: "People", items: [
    { title: "Employees", icon: "bi-people", href: "employees.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive", "manager", "team_lead"] },
    { title: "Departments & Org", icon: "bi-diagram-3", href: "departments.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive"] }
  ]},
  { group: "Recruitment", items: [
    { title: "Recruitment", icon: "bi-person-plus", href: "recruitment.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive"] },
    { title: "Onboarding", icon: "bi-clipboard2-check", href: "onboarding.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive"] }
  ]},
  { group: "Attendance & Leave", items: [
    { title: "Attendance Hub", icon: "bi-calendar3-week", href: "attendance.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive", "manager", "team_lead"] },
    { title: "Leave Management", icon: "bi-calendar2-check", href: "leave.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive", "manager", "team_lead"] }
  ]},
  { group: "Payroll", items: [
    { title: "Payroll", icon: "bi-cash-stack", href: "payroll.html", roles: ["super_admin", "admin", "payroll_manager"] },
    { title: "Payslips", icon: "bi-receipt", href: "payslip.html", roles: ["all"] }
  ]},
  { group: "Performance", items: [
    { title: "Performance", icon: "bi-graph-up-arrow", href: "performance.html", roles: ["super_admin", "admin", "hr_manager", "manager", "team_lead"] }
  ]},
  { group: "Finance & Assets", items: [
    { title: "Expenses", icon: "bi-wallet2", href: "expenses.html", roles: ["all"] },
    { title: "Assets", icon: "bi-laptop", href: "asset-management.html", roles: ["all"] }
  ]},
  { group: "Documents", items: [
    { title: "Documents", icon: "bi-folder2-open", href: "documents.html", roles: ["all"] }
  ]},
  { group: "Communication", items: [
    { title: "Announcements", icon: "bi-megaphone", href: "announcements.html", roles: ["all"] }
  ]},
  { group: "Insights", items: [
    { title: "Reports", icon: "bi-bar-chart-line", href: "reports.html", roles: ["super_admin", "admin", "hr_manager", "hr_executive", "payroll_manager", "manager"] }
  ]},
  { group: "Administration", items: [
    { title: "Settings", icon: "bi-gear", href: "settings.html", roles: ["super_admin", "admin", "hr_manager", "payroll_manager"] }
  ]}
];

/* ---------------------------------------------------------------------- */
/* SMALL FORMAT HELPERS (used across pages)                                 */
/* ---------------------------------------------------------------------- */

function formatINR(n) {
  if (n === null || n === undefined) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}
function formatDateReadable(iso) {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function statusSlug(s) { return String(s).toLowerCase().replace(/\s+/g, ""); }
function initialsOf(name) { return name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase(); }
