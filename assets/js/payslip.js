/* ==========================================================================
   PAYSLIP.JS
   ========================================================================== */

const psMonths = ["April 2026", "May 2026", "June 2026", "July 2026", "August 2026", "September 2026"];
let psSelectedMonth = "September 2026";

document.addEventListener("DOMContentLoaded", () => {
  const id = qs("id") || getCurrentUser().empRef;
  const emp = getEmployeeById(id) || getEmployeeById(getCurrentUser().empRef);

  renderPageHeader("pageHeaderMount", "Payslip", `Salary slip for ${emp.name} — ${psSelectedMonth}.`,
    `<button class="btn btn-light-2" id="psDownloadBtn"><i class="bi bi-download me-1"></i>Download</button>
     <button class="btn btn-primary" id="psPrintBtn"><i class="bi bi-printer me-1"></i>Print</button>`);

  document.getElementById("payslipMonthPicker").innerHTML = `
    <div class="d-flex align-items-center gap-2 flex-wrap">
      <label class="form-label mb-0" style="font-size:.82rem;">Pay Period:</label>
      <select class="form-select form-select-sm" style="width:auto;" id="psMonthSelect">
        ${psMonths.slice().reverse().map(m => `<option ${m === psSelectedMonth ? "selected" : ""}>${m}</option>`).join("")}
      </select>
    </div>`;

  document.getElementById("psMonthSelect").addEventListener("change", (e) => {
    psSelectedMonth = e.target.value;
    renderPayslip(emp);
  });
  document.getElementById("psPrintBtn").addEventListener("click", () => window.print());
  document.getElementById("psDownloadBtn").addEventListener("click", () => showToast("Payslip PDF download will be connected to backend later.", "info"));

  renderPayslip(emp);
});

function renderPayslip(emp) {
  const mount = document.getElementById("payslipMount");
  const overtime = emp.id === "EMP001" ? 900 : 0;
  const totalEarnings = emp.basic + emp.hra + emp.allowances + emp.bonus + overtime;
  const totalDeductions = emp.deductions + emp.tax;
  const netPay = totalEarnings - totalDeductions;
  const pf = Math.round(emp.basic * 0.12);
  const profTax = 200;
  const otherDed = Math.max(0, emp.deductions - pf - profTax);

  mount.innerHTML = `
  <div class="payslip-doc" data-aos="fade-up">
    <div class="ps-head">
      <div class="ps-brand">
        <div class="logo-box">N</div>
        <div>
          <div class="co-name">NimbusHR Technologies Pvt. Ltd.</div>
          <div class="co-addr">4th Floor, Prestige Tech Park, Bengaluru, Karnataka 560103, India</div>
        </div>
      </div>
      <div class="ps-title">
        <h4>Payslip</h4>
        <span>${psSelectedMonth}</span>
      </div>
    </div>

    <div class="ps-info-grid">
      <div><div class="lbl">Employee Name</div><div class="val">${emp.name}</div></div>
      <div><div class="lbl">Employee ID</div><div class="val">${emp.id}</div></div>
      <div><div class="lbl">Designation</div><div class="val">${emp.designation}</div></div>
      <div><div class="lbl">Department</div><div class="val">${emp.department}</div></div>
      <div><div class="lbl">Bank Account</div><div class="val">XXXXXXXX${emp.id.slice(-3)}21</div></div>
      <div><div class="lbl">PAN</div><div class="val">ABCDE${emp.id.slice(-4)}F</div></div>
      <div><div class="lbl">Work Location</div><div class="val">${emp.workLocation}</div></div>
      <div><div class="lbl">Employment Type</div><div class="val">${emp.employmentType}</div></div>
      <div><div class="lbl">Payment Date</div><div class="val">28 ${psSelectedMonth}</div></div>
    </div>

    <div class="ps-cols">
      <div>
        <div class="ps-col-head">Earnings</div>
        <div class="ps-line"><span>Basic Salary</span><span class="num">${formatINR(emp.basic)}</span></div>
        <div class="ps-line"><span>House Rent Allowance</span><span class="num">${formatINR(emp.hra)}</span></div>
        <div class="ps-line"><span>Special Allowance</span><span class="num">${formatINR(emp.allowances)}</span></div>
        <div class="ps-line"><span>Performance Bonus</span><span class="num">${formatINR(emp.bonus)}</span></div>
        <div class="ps-line"><span>Overtime</span><span class="num">${formatINR(overtime)}</span></div>
        <div class="ps-line total"><span>Gross Earnings</span><span class="num">${formatINR(totalEarnings)}</span></div>
      </div>
      <div>
        <div class="ps-col-head">Deductions</div>
        <div class="ps-line"><span>Provident Fund (PF)</span><span class="num">${formatINR(pf)}</span></div>
        <div class="ps-line"><span>Professional Tax</span><span class="num">${formatINR(profTax)}</span></div>
        <div class="ps-line"><span>Income Tax (TDS)</span><span class="num">${formatINR(emp.tax)}</span></div>
        <div class="ps-line"><span>Other Deductions</span><span class="num">${formatINR(otherDed)}</span></div>
        <div class="ps-line total"><span>Total Deductions</span><span class="num">${formatINR(totalDeductions)}</span></div>
      </div>
    </div>

    <div class="ps-net">
      <div>
        <div style="font-size:.78rem;color:var(--text-secondary);">Net Pay for ${psSelectedMonth}</div>
        <div style="font-size:.72rem;color:var(--text-muted);">Gross Earnings − Total Deductions</div>
      </div>
      <div class="amt num">${formatINR(netPay)}</div>
    </div>

    <div class="ps-footer">This is a system-generated payslip and does not require a signature. NimbusHR Technologies Pvt. Ltd. — Demo data for UI purposes only.</div>
  </div>`;
}
