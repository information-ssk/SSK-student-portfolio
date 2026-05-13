# Frontend Specification

This frontend supports a teacher-friendly student portfolio interface for SSK school.

## Features

- Login screen with department selection and email validation for @ssk.ac.th users.
- Admin login by selecting `Admin` and using password `adminssk`.
- Home screen with searchable, filterable achievement cards.
- Manage screen showing user-related records and a detail modal.
- Record screen with dynamic competition entries and file upload support.
- All frontend network calls use the single constant `APPSCRIPT_URL` in `frontend/auth.js`.
- Session persistence uses `localStorage` keys `ssk_user_token`, `ssk_user_email`, and `ssk_user_dept`.

## File Structure

- `frontend/auth.js` - token-based login, validation, localStorage session persistence, and retry logic.
- `frontend/app.js` - page wiring, record submission, list rendering, pagination helper, and UI state.
- `src/main.js` - Vite entrypoint that loads `frontend/app.js`.
- `index.html` - page markup and root Vite bootstrap.

## Environment

- `VITE_APPSCRIPT_URL` must be set in Vercel to the deployed Apps Script web app URL.
- `VITE_SHEET_ID` is also configured in Vercel for reference and future backend integration.
  <script>
// ==================== STATE ====================
let currentUser = null; // { dept, email, isAdmin }
let achievements = []; // stored achievements
let editingIndex = null;
let deleteIndex = null;
let competitionCounter = 0;

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUMl8DqVfVkjsUVJQ_YG3yqQdHynpkzZwSfhtk8eL3x1G2-LZfr_w4ukZSXzxGTzAq/exec';

// ==================== NAVIGATION ====================
function showPage(page) {
    document.querySelectorAll('[id^="page-"]').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    window.scrollTo(0, 0);
    if (page === 'manage') renderManageList();
    if (page === 'home') renderHomeGrid();
}

// ==================== TOAST ====================
function showToast(msg, type = 'success') {
    const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-pink-500' };
    const div = document.createElement('div');
    div.className = `toast ${colors[type] || colors.info}`;
    div.textContent = msg;
    document.getElementById('toast-container').appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ==================== LOGIN ====================
function toggleEmailField() {
    const dept = document.getElementById('login-dept').value;
    document.getElementById('login-email-wrap').classList.toggle('hidden', dept === 'Admin');
    document.getElementById('login-other-dept-wrap').classList.toggle('hidden', dept !== 'อื่นๆ');
}

function handleLogin(e) {
    e.preventDefault();
    const dept = document.getElementById('login-dept').value;
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!dept) { errEl.textContent = 'กรุณาเลือกหน่วยงาน'; errEl.classList.remove('hidden'); return; }

    if (dept === 'Admin') {
        if (password !== 'adminssk') { errEl.textContent = 'รหัสผ่าน Admin ไม่ถูกต้อง'; errEl.classList.remove('hidden'); return; }
        currentUser = { dept: 'Admin', email: 'admin', isAdmin: true };
    } else {
        if (!email.endsWith('@ssk.ac.th')) { errEl.textContent = 'กรุณาใช้อีเมล @ssk.ac.th เท่านั้น'; errEl.classList.remove('hidden'); return; }
        if (password !== 'sskssk') { errEl.textContent = 'รหัสผ่านไม่ถูกต้อง'; errEl.classList.remove('hidden'); return; }
        let finalDept = dept;
        if (dept === 'อื่นๆ') {
            finalDept = document.getElementById('login-other-dept').value.trim() || 'อื่นๆ';
        }
        currentUser = { dept: finalDept, email, isAdmin: false };
    }

    document.getElementById('record-user-badge').textContent = currentUser.dept;
    document.getElementById('manage-user-badge').textContent = currentUser.isAdmin ? '🔑 Admin' : currentUser.dept;
    showToast('เข้าสู่ระบบสำเร็จ', 'success');
    loadAchievementsFromSheet();
    showPage('manage');
}

function handleLogout() {
    currentUser = null;
    showPage('home');
    showToast('ออกจากระบบแล้ว', 'info');
}

// ==================== RECORD FORM ====================
function initRecordForm() {
    editingIndex = null;
    document.getElementById('record-form').reset();
    document.getElementById('competition-items-container').innerHTML = '';
    document.getElementById('file-preview').innerHTML = '';
    document.getElementById('save-status').classList.add('hidden');
    competitionCounter = 0;
    addCompetitionItem();
}

function addCompetitionItem() {
    competitionCounter++;
    const idx = competitionCounter;
    const container = document.getElementById('competition-items-container');
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl border border-pink-100 p-6 mb-5 shadow-sm fade-in';
    div.id = `comp-item-${idx}`;
    div.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-heading font-semibold text-pink-700 flex items-center gap-2"><i data-lucide="award" style="width:18px;height:18px;"></i> รายการแข่งขันที่ ${idx}</h3>
            ${idx > 1 ? `<button type="button" onclick="removeCompetitionItem(${idx})" class="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"><i data-lucide="trash-2" style="width:14px;height:14px;"></i> ลบ</button>` : ''}
        </div>
        <div class="mb-4">
            <label class="text-sm font-medium text-gray-600">ชื่อรายการแข่งขัน</label>
            <input type="text" class="input-style mt-1 comp-name" placeholder="ชื่อรายการ">
        </div>
        <div class="mb-4">
            <label class="text-sm font-medium text-gray-600">ประเภทการแข่งขัน</label>
            <select class="select-style mt-1 comp-type" onchange="toggleCompType(this, ${idx})">
                <option value="เดี่ยว">เดี่ยว</option>
                <option value="คู่/ทีม">คู่/ทีม</option>
            </select>
        </div>
        <div id="comp-students-${idx}"></div>
        <button type="button" onclick="addStudentEntry(${idx})" class="mb-4 text-sm text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1"><i data-lucide="user-plus" style="width:14px;height:14px;"></i> <span class="add-student-label">เพิ่มนักเรียน</span></button>
        
        <!-- Coaches -->
        <div class="border-t border-pink-50 pt-4 mt-4">
            <h4 class="text-sm font-semibold text-pink-600 mb-3">ครูผู้ฝึกซ้อม</h4>
            <div id="comp-coaches-${idx}"></div>
            <button type="button" onclick="addCoach(${idx})" class="text-sm text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1"><i data-lucide="user-plus" style="width:14px;height:14px;"></i> เพิ่มครูผู้ฝึกซ้อม</button>
        </div>
    `;
    container.appendChild(div);
    addStudentEntry(idx);
    addCoach(idx);
    lucide.createIcons();
}

function removeCompetitionItem(idx) {
    document.getElementById(`comp-item-${idx}`).remove();
    renumberCompetitions();
}

function renumberCompetitions() {
    const items = document.getElementById('competition-items-container').children;
    for (let i = 0; i < items.length; i++) {
        items[i].querySelector('h3').innerHTML = `<i data-lucide="award" style="width:18px;height:18px;"></i> รายการแข่งขันที่ ${i + 1}`;
    }
    lucide.createIcons();
}

function toggleCompType(select, idx) {
    const container = document.getElementById(`comp-students-${idx}`);
    container.innerHTML = '';
    const isTeam = select.value === 'คู่/ทีม';
    const item = document.getElementById(`comp-item-${idx}`);
    item.querySelector('.add-student-label').textContent = isTeam ? 'เพิ่มคู่/ทีม' : 'เพิ่มนักเรียน';
    addStudentEntry(idx);
}

let studentCounters = {};
function addStudentEntry(compIdx) {
    if (!studentCounters[compIdx]) studentCounters[compIdx] = 0;
    studentCounters[compIdx]++;
    const num = studentCounters[compIdx];
    const container = document.getElementById(`comp-students-${compIdx}`);
    const compType = document.querySelector(`#comp-item-${compIdx} .comp-type`).value;
    const isTeam = compType === 'คู่/ทีม';

    const div = document.createElement('div');
    div.className = 'border border-pink-50 rounded-lg p-4 mb-3 bg-pink-50/30 student-entry';
    div.dataset.num = num;

    if (isTeam) {
        div.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-semibold text-pink-600">คู่/ทีม ที่ ${container.querySelectorAll('.student-entry').length + 1}</span>
                ${num > 1 ? `<button type="button" onclick="removeStudentEntry(this, ${compIdx})" class="text-red-400 hover:text-red-600 text-xs">ลบ</button>` : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="text-xs text-gray-500">ระดับเหรียญ</label>
                    <select class="select-style text-sm mt-1 medal-select">
                        <option value="ทอง">ทอง</option><option value="เงิน">เงิน</option><option value="ทองแดง">ทองแดง</option><option value="อื่น">อื่น (ระบุ)</option><option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                    <input type="text" class="input-style text-sm mt-1 hidden medal-other" placeholder="ระบุ">
                </div>
                <div>
                    <label class="text-xs text-gray-500">รางวัล</label>
                    <select class="select-style text-sm mt-1 award-select">
                        <option value="ชนะเลิศ">ชนะเลิศ</option><option value="รองชนะเลิศอันดับ1">รองชนะเลิศอันดับ1</option><option value="รองชนะเลิศอันดับ2">รองชนะเลิศอันดับ2</option><option value="ชมเชย">ชมเชย</option><option value="เข้าร่วม">เข้าร่วม</option><option value="อื่นๆ">อื่นๆ (ระบุ)</option>
                    </select>
                    <input type="text" class="input-style text-sm mt-1 hidden award-other" placeholder="ระบุ">
                </div>
            </div>
            <div class="mb-3">
                <label class="text-xs text-gray-500">ชื่อทีม (ถ้ามี)</label>
                <input type="text" class="input-style text-sm mt-1 team-name" placeholder="ชื่อทีม">
            </div>
            <div class="team-members-container"></div>
            <button type="button" onclick="addTeamMember(this)" class="text-xs text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1 mt-2"><i data-lucide="user-plus" style="width:12px;height:12px;"></i> เพิ่มสมาชิกในทีม</button>
        `;
        const membersContainer = div.querySelector('.team-members-container');
        addTeamMemberTo(membersContainer);
        addTeamMemberTo(membersContainer);
    } else {
        div.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-semibold text-pink-600">นักเรียนที่ ${container.querySelectorAll('.student-entry').length + 1}</span>
                ${num > 1 ? `<button type="button" onclick="removeStudentEntry(this, ${compIdx})" class="text-red-400 hover:text-red-600 text-xs">ลบ</button>` : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="text-xs text-gray-500">ระดับเหรียญ</label>
                    <select class="select-style text-sm mt-1 medal-select">
                        <option value="ทอง">ทอง</option><option value="เงิน">เงิน</option><option value="ทองแดง">ทองแดง</option><option value="อื่น">อื่น (ระบุ)</option><option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                    <input type="text" class="input-style text-sm mt-1 hidden medal-other" placeholder="ระบุ">
                </div>
                <div>
                    <label class="text-xs text-gray-500">รางวัล</label>
                    <select class="select-style text-sm mt-1 award-select">
                        <option value="ชนะเลิศ">ชนะเลิศ</option><option value="รองชนะเลิศอันดับ1">รองชนะเลิศอันดับ1</option><option value="รองชนะเลิศอันดับ2">รองชนะเลิศอันดับ2</option><option value="ชมเชย">ชมเชย</option><option value="เข้าร่วม">เข้าร่วม</option><option value="อื่นๆ">อื่นๆ (ระบุ)</option>
                    </select>
                    <input type="text" class="input-style text-sm mt-1 hidden award-other" placeholder="ระบุ">
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <select class="select-style text-sm prefix-select"><option>เด็กชาย</option><option>เด็กหญิง</option><option>นาย</option><option>นางสาว</option></select>
                <input type="text" class="input-style text-sm" placeholder="ชื่อ">
                <input type="text" class="input-style text-sm" placeholder="สกุล">
                <input type="text" class="input-style text-sm" placeholder="ชั้น">
                <input type="text" class="input-style text-sm" placeholder="ห้อง">
            </div>
        `;
    }

    container.appendChild(div);
    // Add event listeners for medal/award other fields
    div.querySelectorAll('.medal-select').forEach(sel => sel.addEventListener('change', function() {
        this.nextElementSibling.classList.toggle('hidden', this.value !== 'อื่น');
    }));
    div.querySelectorAll('.award-select').forEach(sel => sel.addEventListener('change', function() {
        this.nextElementSibling.classList.toggle('hidden', this.value !== 'อื่นๆ');
    }));
    lucide.createIcons();
}

function removeStudentEntry(btn, compIdx) {
    btn.closest('.student-entry').remove();
    renumberStudents(compIdx);
}

function renumberStudents(compIdx) {
    const container = document.getElementById(`comp-students-${compIdx}`);
    const entries = container.querySelectorAll('.student-entry');
    const compType = document.querySelector(`#comp-item-${compIdx} .comp-type`).value;
    const isTeam = compType === 'คู่/ทีม';
    entries.forEach((entry, i) => {
        entry.querySelector('.text-pink-600').textContent = isTeam ? `คู่/ทีม ที่ ${i + 1}` : `นักเรียนที่ ${i + 1}`;
    });
    studentCounters[compIdx] = entries.length;
}

function addTeamMember(btn) {
    const container = btn.previousElementSibling || btn.parentElement.querySelector('.team-members-container');
    addTeamMemberTo(container);
}

function addTeamMemberTo(container) {
    const num = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'grid grid-cols-2 sm:grid-cols-6 gap-2 mb-2 team-member';
    div.innerHTML = `
        <span class="text-xs text-gray-400 self-center">นร.${num}</span>
        <select class="select-style text-sm"><option>เด็กชาย</option><option>เด็กหญิง</option><option>นาย</option><option>นางสาว</option></select>
        <input type="text" class="input-style text-sm" placeholder="ชื่อ">
        <input type="text" class="input-style text-sm" placeholder="สกุล">
        <input type="text" class="input-style text-sm" placeholder="ชั้น">
        <input type="text" class="input-style text-sm" placeholder="ห้อง">
    `;
    container.appendChild(div);
    // Add remove btn for members > 2
    if (num > 2) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'text-red-400 hover:text-red-600 text-xs col-span-full text-right';
        removeBtn.textContent = 'ลบสมาชิก';
        removeBtn.onclick = function() { div.remove(); renumberTeamMembers(container); };
        div.appendChild(removeBtn);
    }
}

function renumberTeamMembers(container) {
    const members = container.querySelectorAll('.team-member');
    members.forEach((m, i) => {
        const label = m.querySelector('span');
        if (label) label.textContent = `นร.${i + 1}`;
    });
}

function addCoach(compIdx) {
    const container = document.getElementById(`comp-coaches-${compIdx}`);
    const num = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2 coach-entry';
    div.innerHTML = `
        <select class="select-style text-sm"><option>นาย</option><option>นาง</option><option>นางสาว</option></select>
        <input type="text" class="input-style text-sm" placeholder="ชื่อ">
        <input type="text" class="input-style text-sm" placeholder="สกุล">
        <select class="select-style text-sm coach-dept">
            <optgroup label="กลุ่มสาระ"><option>ภาษาไทย</option><option>คณิตศาสตร์</option><option>วิทยาศาสตร์และเทคโนโลยี</option><option>สังคมศึกษาฯ</option><option>ภาษาต่างประเทศ</option><option>สุขศึกษาและพลศึกษา</option><option>ศิลปะ</option><option>การงานอาชีพ</option></optgroup>
            <optgroup label="กลุ่มงาน"><option>กลุ่มงานวิชาการ</option><option>กลุ่มงานบริหารทั่วไป</option><option>กลุ่มงานงบประมาณ</option><option>กลุ่มงานบุคคล</option></optgroup>
            <option>อื่นๆ</option>
        </select>
        ${num > 1 ? `<button type="button" onclick="this.closest('.coach-entry').remove()" class="text-red-400 hover:text-red-600 text-xs self-center">ลบ</button>` : '<span></span>'}
    `;
    container.appendChild(div);
}

// ==================== FILE HANDLING ====================
function validateFiles(input) {
    const preview = document.getElementById('file-preview');
    preview.innerHTML = '';
    if (input.files.length > 5) {
        showToast('อัปโหลดได้สูงสุด 5 ไฟล์', 'error');
        input.value = '';
        return;
    }
    Array.from(input.files).forEach(file => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-pink-100 text-pink-700 text-xs';
        badge.textContent = file.name;
        preview.appendChild(badge);
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== COLLECT FORM DATA ====================
function collectFormData() {
    const year = document.getElementById('rec-year').value === 'อื่นๆ' ? document.getElementById('rec-year-other').value : document.getElementById('rec-year').value;
    const data = {
        year,
        level: document.getElementById('rec-level').value,
        project: document.getElementById('rec-project').value,
        org: document.getElementById('rec-org').value,
        place: document.getElementById('rec-place').value,
        date: document.getElementById('rec-date').value,
        competitions: [],
        recordedBy: currentUser.email,
        recordedDept: currentUser.dept,
        timestamp: new Date().toISOString()
    };

    document.querySelectorAll('[id^="comp-item-"]').forEach(item => {
        const comp = {
            name: item.querySelector('.comp-name').value,
            type: item.querySelector('.comp-type').value,
            entries: [],
            coaches: []
        };

        item.querySelectorAll('.student-entry').forEach(entry => {
            const medalSel = entry.querySelector('.medal-select');
            const awardSel = entry.querySelector('.award-select');
            const medal = medalSel.value === 'อื่น' ? entry.querySelector('.medal-other').value : medalSel.value;
            const award = awardSel.value === 'อื่นๆ' ? entry.querySelector('.award-other').value : awardSel.value;

            if (comp.type === 'คู่/ทีม') {
                const teamName = entry.querySelector('.team-name')?.value || '';
                const members = [];
                entry.querySelectorAll('.team-member').forEach(m => {
                    const inputs = m.querySelectorAll('input');
                    const selects = m.querySelectorAll('select');
                    members.push({
                        prefix: selects[0]?.value || '',
                        firstName: inputs[0]?.value || '',
                        lastName: inputs[1]?.value || '',
                        grade: inputs[2]?.value || '',
                        room: inputs[3]?.value || ''
                    });
                });
                comp.entries.push({ medal, award, teamName, members });
            } else {
                const inputs = entry.querySelectorAll('.grid input');
                const selects = entry.querySelectorAll('.grid select');
                comp.entries.push({
                    medal, award,
                    prefix: selects[0]?.value || '',
                    firstName: inputs[0]?.value || '',
                    lastName: inputs[1]?.value || '',
                    grade: inputs[2]?.value || '',
                    room: inputs[3]?.value || ''
                });
            }
        });

        item.querySelectorAll('.coach-entry').forEach(c => {
            const selects = c.querySelectorAll('select');
            const inputs = c.querySelectorAll('input');
            comp.coaches.push({
                prefix: selects[0]?.value || '',
                firstName: inputs[0]?.value || '',
                lastName: inputs[1]?.value || '',
                dept: selects[1]?.value || ''
            });
        });

        data.competitions.push(comp);
    });

    return data;
}

// ==================== SAVE RECORD ====================
async function handleSaveRecord(e) {
    e.preventDefault();
    const statusEl = document.getElementById('save-status');
    const btnSave = document.getElementById('btn-save-record');
    
    if (!document.getElementById('rec-project').value.trim()) {
        showToast('กรุณากรอกชื่อโครงการ', 'error');
        return;
    }

    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="loading-spinner"></span> กำลังบันทึก...';
    statusEl.classList.remove('hidden');
    statusEl.className = 'mt-4 text-center p-3 rounded-lg bg-yellow-50 text-yellow-700';
    statusEl.innerHTML = '<span class="loading-spinner"></span> กำลังอัปโหลดข้อมูลและไฟล์...';

    try {
        const formData = collectFormData();
        const files = document.getElementById('rec-files').files;
        let fileUrls = [];

        // Upload files
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const base64 = await fileToBase64(files[i]);
                const params = new URLSearchParams();
                params.append('action', 'uploadFile');
                params.append('fileName', files[i].name);
                params.append('mimeType', files[i].type);
                params.append('base64Data', base64);

                const resp = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: params });
                const result = await resp.json();
                if (result.success) {
                    fileUrls.push(result.fileUrl);
                }
            }
        }

        formData.fileUrls = fileUrls;

        // Save to sheet
        const params = new URLSearchParams();
        params.append('action', editingIndex !== null ? 'updateRecord' : 'saveRecord');
        params.append('data', JSON.stringify(formData));
        if (editingIndex !== null) {
            params.append('rowIndex', achievements[editingIndex].rowIndex);
        }

        const resp = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: params });
        const result = await resp.json();

        if (result.success) {
            statusEl.className = 'mt-4 text-center p-3 rounded-lg bg-green-50 text-green-700';
            statusEl.textContent = '✅ บันทึกข้อมูลสำเร็จ!';
            showToast('บันทึกผลงานสำเร็จ!', 'success');
            loadAchievementsFromSheet();
            setTimeout(() => showPage('manage'), 1500);
        } else {
            throw new Error(result.message || 'เกิดข้อผิดพลาด');
        }
    } catch (err) {
        statusEl.className = 'mt-4 text-center p-3 rounded-lg bg-red-50 text-red-700';
        statusEl.textContent = '❌ เกิดข้อผิดพลาด: ' + err.message;
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }

    btnSave.disabled = false;
    btnSave.innerHTML = '<i data-lucide="save" style="width:18px;height:18px;"></i> บันทึกข้อมูล';
    lucide.createIcons();
}

// ==================== LOAD DATA ====================
async function loadAchievementsFromSheet() {
    try {
        const resp = await fetch(APPS_SCRIPT_URL + '?action=getRecords');
        const result = await resp.json();
        if (result.success) {
            achievements = result.data || [];
            renderHomeGrid();
            if (currentUser) renderManageList();
        }
    } catch (err) {
        console.error('Load error:', err);
    }
}

// ==================== RENDER HOME GRID ====================
function renderHomeGrid() {
    const grid = document.getElementById('achievement-grid');
    const search = document.getElementById('search-input').value.toLowerCase();
    const levelFilter = document.getElementById('filter-level').value;

    let filtered = achievements.filter(a => {
        const matchSearch = !search || JSON.stringify(a).toLowerCase().includes(search);
        const matchLevel = !levelFilter || a.level === levelFilter;
        return matchSearch && matchLevel;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="text-center text-pink-300 py-16 col-span-full"><i data-lucide="search" style="width:48px;height:48px;margin:0 auto 12px;"></i><p class="text-lg">ไม่พบผลงาน</p></div>`;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = filtered.map((a, i) => {
        const levelColors = { 'นานาชาติ': 'bg-purple-100 text-purple-700', 'ชาติ': 'bg-red-100 text-red-700', 'ภาค(เทียบเท่าชาติ)': 'bg-orange-100 text-orange-700', 'ภาค': 'bg-yellow-100 text-yellow-700', 'จังหวัด': 'bg-blue-100 text-blue-700', 'เขตพื้นที่การศึกษา': 'bg-green-100 text-green-700' };
        const color = levelColors[a.level] || 'bg-gray-100 text-gray-700';
        const compCount = a.competitions?.length || 0;
        return `
            <div class="bg-white rounded-xl border border-pink-100 p-5 card-hover cursor-pointer" onclick="showDetail(${i})">
                <div class="flex justify-between items-start mb-3">
                    <span class="badge ${color}">${a.level || '-'}</span>
                    <span class="text-xs text-gray-400">${a.year || ''}</span>
                </div>
                <h3 class="font-heading font-semibold text-gray-800 mb-2 line-clamp-2">${a.project || '-'}</h3>
                <p class="text-sm text-gray-500 mb-3">${a.org || ''} ${a.place ? '• ' + a.place : ''}</p>
                <div class="flex items-center gap-2 text-xs text-pink-400">
                    <i data-lucide="award" style="width:12px;height:12px;"></i> ${compCount} รายการ
                    ${a.fileUrls?.length ? `<span class="ml-auto"><i data-lucide="paperclip" style="width:12px;height:12px;"></i> ${a.fileUrls.length} ไฟล์</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function filterAchievements() { renderHomeGrid(); }

// ==================== DETAIL MODAL ====================
function showDetail(idx) {
    const a = achievements[idx];
    document.getElementById('detail-title').textContent = a.project || '-';
    let html = `
        <div class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-3">
                <div><span class="text-gray-400">ปีการศึกษา:</span> <strong>${a.year}</strong></div>
                <div><span class="text-gray-400">ระดับ:</span> <strong>${a.level}</strong></div>
                <div><span class="text-gray-400">หน่วยงาน:</span> ${a.org || '-'}</div>
                <div><span class="text-gray-400">สถานที่:</span> ${a.place || '-'}</div>
                <div><span class="text-gray-400">วันที่:</span> ${a.date || '-'}</div>
            </div>
    `;

    if (a.competitions?.length) {
        a.competitions.forEach((comp, ci) => {
            html += `<div class="border-t border-pink-100 pt-3 mt-3"><h4 class="font-semibold text-pink-700">🏆 ${comp.name || 'รายการที่ ' + (ci+1)} (${comp.type})</h4>`;
            comp.entries?.forEach(entry => {
                if (comp.type === 'คู่/ทีม') {
                    html += `<div class="ml-4 mt-2 p-2 bg-pink-50 rounded"><p class="text-xs"><strong>เหรียญ:</strong> ${entry.medal} | <strong>รางวัล:</strong> ${entry.award} ${entry.teamName ? '| <strong>ทีม:</strong> ' + entry.teamName : ''}</p>`;
                    entry.members?.forEach(m => { html += `<p class="text-xs text-gray-600">- ${m.prefix}${m.firstName} ${m.lastName} ${m.grade}/${m.room}</p>`; });
                    html += `</div>`;
                } else {
                    html += `<div class="ml-4 mt-1 text-xs"><span class="badge bg-yellow-100 text-yellow-700 mr-1">${entry.medal}</span><span class="badge bg-blue-100 text-blue-700 mr-2">${entry.award}</span>${entry.prefix}${entry.firstName} ${entry.lastName} ${entry.grade}/${entry.room}</div>`;
                }
            });
            if (comp.coaches?.length) {
                html += `<p class="ml-4 mt-2 text-xs text-gray-500">👨‍🏫 ครูผู้ฝึกซ้อม: ${comp.coaches.map(c => c.prefix + c.firstName + ' ' + c.lastName + ' (' + c.dept + ')').join(', ')}</p>`;
            }
            html += `</div>`;
        });
    }

    if (a.fileUrls?.length) {
        html += `<div class="border-t border-pink-100 pt-3 mt-3"><h4 class="font-semibold text-pink-700 mb-2">📎 ไฟล์แนบ</h4><div class="flex flex-wrap gap-2">`;
        a.fileUrls.forEach((url, fi) => {
            html += `<a href="${url}" target="_blank" rel="noopener noreferrer" class="badge bg-pink-100 text-pink-700 hover:bg-pink-200">ไฟล์ ${fi+1}</a>`;
        });
        html += `</div></div>`;
    }

    html += `</div>`;
    document.getElementById('detail-content').innerHTML = html;
    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() { document.getElementById('detail-modal').classList.add('hidden'); }

// ==================== MANAGE LIST ====================
function renderManageList() {
    const container = document.getElementById('manage-list');
    if (!currentUser) return;

    let filtered = achievements;
    if (!currentUser.isAdmin) {
        filtered = achievements.filter(a => {
            if (a.recordedBy === currentUser.email) return true;
            if (a.recordedDept === currentUser.dept) return true;
            // Check coaches
            return a.competitions?.some(c => c.coaches?.some(coach => coach.dept === currentUser.dept));
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center text-pink-300 py-12"><p>ยังไม่มีผลงานที่บันทึก</p></div>';
        return;
    }

    container.innerHTML = filtered.map((a, i) => {
        const realIdx = achievements.indexOf(a);
        const isOwn = a.recordedBy === currentUser.email || a.recordedDept === currentUser.dept;
        const isRelated = !isOwn && a.competitions?.some(c => c.coaches?.some(coach => coach.dept === currentUser.dept));
        const canEdit = currentUser.isAdmin || isOwn || isRelated;
        return `
            <div class="bg-white rounded-xl border border-pink-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-3">
                <div class="flex-1 cursor-pointer" onclick="showDetail(${realIdx})">
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-gray-800">${a.project || '-'}</h4>
                        ${isRelated && !isOwn ? '<span class="badge bg-blue-100 text-blue-700 text-xs">เกี่ยวข้องกับหน่วยงานของคุณ</span>' : ''}
                    </div>
                    <p class="text-sm text-gray-500">${a.level} • ${a.year} • ${a.org || ''}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="showDetail(${realIdx})" class="px-3 py-1.5 text-xs rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50">ดู</button>
                    ${canEdit ? `
                        <button onclick="editRecord(${realIdx})" class="px-3 py-1.5 text-xs rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50">แก้ไข</button>
                        <button onclick="requestDelete(${realIdx})" class="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50">ลบ</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== EDIT/DELETE ====================
function editRecord(idx) {
    editingIndex = idx;
    showPage('record');
    const a = achievements[idx];
    document.getElementById('rec-year').value = ['2568','2569','2570','2571','2572'].includes(a.year) ? a.year : 'อื่นๆ';
    if (!['2568','2569','2570','2571','2572'].includes(a.year)) {
        document.getElementById('rec-year-other').classList.remove('hidden');
        document.getElementById('rec-year-other').value = a.year;
    }
    document.getElementById('rec-level').value = a.level || '';
    document.getElementById('rec-project').value = a.project || '';
    document.getElementById('rec-org').value = a.org || '';
    document.getElementById('rec-place').value = a.place || '';
    document.getElementById('rec-date').value = a.date || '';
    // Note: competitions would need more complex reconstruction - simplified here
    document.getElementById('competition-items-container').innerHTML = '';
    competitionCounter = 0;
    if (a.competitions?.length) {
        a.competitions.forEach(() => addCompetitionItem());
    } else {
        addCompetitionItem();
    }
}

function requestDelete(idx) {
    deleteIndex = idx;
    document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() { document.getElementById('delete-modal').classList.add('hidden'); deleteIndex = null; }

async function confirmDelete() {
    if (deleteIndex === null) return;
    const a = achievements[deleteIndex];
    const btn = document.getElementById('btn-confirm-delete');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span>';

    try {
        const params = new URLSearchParams();
        params.append('action', 'deleteRecord');
        params.append('rowIndex', a.rowIndex);
        if (a.fileUrls?.length) {
            params.append('fileUrls', JSON.stringify(a.fileUrls));
        }
        const resp = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: params });
        const result = await resp.json();
        if (result.success) {
            showToast('ลบผลงานสำเร็จ', 'success');
            loadAchievementsFromSheet();
        } else {
            showToast('เกิดข้อผิดพลาดในการลบ', 'error');
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.textContent = 'ลบ';
    closeDeleteModal();
}

// ==================== YEAR OTHER TOGGLE ====================
document.getElementById('rec-year').addEventListener('change', function() {
    document.getElementById('rec-year-other').classList.toggle('hidden', this.value !== 'อื่นๆ');
});

// ==================== INIT ====================
showPage('home');
loadAchievementsFromSheet();
lucide.createIcons();

// ==================== ELEMENT SDK ====================
const defaultConfig = {
    site_title: 'ผลงานความภาคภูมิใจนักเรียน',
    background_color: '#fdf2f8',
    surface_color: '#ffffff',
    text_color: '#831843',
    primary_action_color: '#ec4899',
    secondary_action_color: '#fbcfe8',
    font_family: 'Sarabun',
    font_size: 16
};

window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => {
        const title = config.site_title || defaultConfig.site_title;
        document.getElementById('main-title').textContent = title;
        document.body.style.background = `linear-gradient(135deg, ${config.background_color || defaultConfig.background_color}, white, ${config.background_color || defaultConfig.background_color})`;
        document.querySelectorAll('.btn-pink').forEach(el => {
            el.style.background = `linear-gradient(135deg, ${config.primary_action_color || defaultConfig.primary_action_color}, ${config.text_color || defaultConfig.text_color})`;
        });
        const font = config.font_family || defaultConfig.font_family;
        document.body.style.fontFamily = `${font}, Sarabun, sans-serif`;
        const size = config.font_size || defaultConfig.font_size;
        document.body.style.fontSize = `${size}px`;
    },
    mapToCapabilities: (config) => ({
        recolorables: [
            { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
            { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
            { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
            { get: () => config.primary_action_color || defaultConfig.primary_action_color, set: (v) => { config.primary_action_color = v; window.elementSdk.setConfig({ primary_action_color: v }); } },
            { get: () => config.secondary_action_color || defaultConfig.secondary_action_color, set: (v) => { config.secondary_action_color = v; window.elementSdk.setConfig({ secondary_action_color: v }); } }
        ],
        borderables: [],
        fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
        fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
    }),
    mapToEditPanelValues: (config) => new Map([
        ['site_title', config.site_title || defaultConfig.site_title]
    ])
});
</script>
 <script>(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9fb00422b1a8d020',t:'MTc3ODY1ODAzOC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();</script></body>
</html>'''