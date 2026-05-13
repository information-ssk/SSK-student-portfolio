import { getAchievements } from './supabase.js';

let currentUser = null;
let achievements = [];

async function loadAchievements() {
  achievements = await getAchievements();
  renderHomeGrid();
  if (currentUser) renderManageList();
}

function showPage(page) {
  document.querySelectorAll('[id^="page-"]').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');
  window.scrollTo(0, 0);
  if (page === 'manage') renderManageList();
  if (page === 'home') renderHomeGrid();
}

function showToast(msg, type = 'success') {
  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-pink-500' };
  const div = document.createElement('div');
  div.className = `toast ${colors[type] || colors.info}`;
  div.textContent = msg;
  document.getElementById('toast-container').appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

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

  if (!dept) {
    errEl.textContent = 'กรุณาเลือกหน่วยงาน';
    errEl.classList.remove('hidden');
    return;
  }

  if (dept === 'Admin') {
    if (password !== 'adminssk') {
      errEl.textContent = 'รหัสผ่าน Admin ไม่ถูกต้อง';
      errEl.classList.remove('hidden');
      return;
    }
    currentUser = { dept: 'Admin', email: 'admin', isAdmin: true };
  } else {
    if (!email.endsWith('@ssk.ac.th')) {
      errEl.textContent = 'กรุณาใช้อีเมล @ssk.ac.th เท่านั้น';
      errEl.classList.remove('hidden');
      return;
    }
    if (password !== 'sskssk') {
      errEl.textContent = 'รหัสผ่านไม่ถูกต้อง';
      errEl.classList.remove('hidden');
      return;
    }
    let finalDept = dept;
    if (dept === 'อื่นๆ') {
      finalDept = document.getElementById('login-other-dept').value.trim() || 'อื่นๆ';
    }
    currentUser = { dept: finalDept, email, isAdmin: false };
  }

  document.getElementById('manage-user-badge').textContent = currentUser.isAdmin ? 'Admin' : currentUser.dept;
  showToast('เข้าสู่ระบบสำเร็จ', 'success');
  loadAchievements();
  showPage('manage');
}

function handleLogout() {
  currentUser = null;
  showPage('home');
  showToast('ออกจากระบบแล้ว', 'info');
}

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

  grid.innerHTML = filtered
    .map((a, i) => {
      const levelColors = {
        'นานาชาติ': 'bg-red-100 text-red-700',
        'ชาติ': 'bg-orange-100 text-orange-700',
        'ภาค(เทียบเท่าชาติ)': 'bg-yellow-100 text-yellow-700',
        'ภาค': 'bg-blue-100 text-blue-700',
        'จังหวัด': 'bg-green-100 text-green-700',
        'เขตพื้นที่การศึกษา': 'bg-cyan-100 text-cyan-700'
      };
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
          </div>
        </div>
      `;
    })
    .join('');
  lucide.createIcons();
}

function filterAchievements() {
  renderHomeGrid();
}

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
      </div>
  `;

  if (a.competitions?.length) {
    a.competitions.forEach((comp, ci) => {
      html += `<div class="border-t border-pink-100 pt-3 mt-3"><h4 class="font-semibold text-pink-700">🏆 ${comp.name || 'รายการที่ ' + (ci + 1)}</h4>`;
      comp.entries?.forEach(entry => {
        html += `<div class="ml-4 mt-1 text-xs badge bg-yellow-100 text-yellow-700 mr-1">${entry.medal || '-'}</div>`;
      });
      html += `</div>`;
    });
  }

  html += `</div>`;
  document.getElementById('detail-content').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.add('hidden');
}

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!currentUser) return;

  let filtered = achievements;
  if (!currentUser.isAdmin) {
    filtered = achievements.filter(
      a => a.recordedBy === currentUser.email || a.recordedDept === currentUser.dept
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-center text-pink-300 py-12"><p>ยังไม่มีผลงานที่บันทึก</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map(a => {
      return `
        <div class="bg-white rounded-xl border border-pink-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-3">
          <div class="flex-1 cursor-pointer" onclick="showDetail(${achievements.indexOf(a)})">
            <h4 class="font-semibold text-gray-800">${a.project || '-'}</h4>
            <p class="text-sm text-gray-500">${a.level} • ${a.year} • ${a.org || ''}</p>
          </div>
          <button onclick="showDetail(${achievements.indexOf(a)})" class="px-3 py-1.5 text-xs rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50">ดู</button>
        </div>
      `;
    })
    .join('');
}

export async function initApp() {
  window.showPage = showPage;
  window.showToast = showToast;
  window.toggleEmailField = toggleEmailField;
  window.handleLogin = handleLogin;
  window.handleLogout = handleLogout;
  window.filterAchievements = filterAchievements;
  window.showDetail = showDetail;
  window.closeDetailModal = closeDetailModal;

  await loadAchievements();
  showPage('home');
}
