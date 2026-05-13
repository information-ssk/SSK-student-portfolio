import {
  login,
  logout,
  autoLogin,
  validateToken,
  getStoredEmail,
  getStoredDept,
  clearAuth,
  APPSCRIPT_URL,
} from './auth.js';

let authState = {
  isAuthenticated: false,
  email: null,
  dept: null,
  token: null,
  isAdmin: false,
  loading: true,
};

let achievements = [];
let currentPage = 1;
const PAGE_SIZE = 9;
let selectedFiles = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, retryCount = 0) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retryCount < 3) {
      await delay(500 * (retryCount + 1));
      return fetchWithRetry(url, options, retryCount + 1);
    }
    throw error;
  }
}

function paginate(items, page = 1, pageSize = PAGE_SIZE) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    items: items.slice(start, start + pageSize),
  };
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-pink-500' : 'bg-green-500'}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function updateUserBadge() {
  const badge = document.getElementById('manage-user-badge');
  if (badge) {
    badge.textContent = authState.isAdmin ? 'Admin' : authState.dept || authState.email || '';
  }
}

function setAuthUI() {
  document.body.classList.toggle('authenticated', authState.isAuthenticated);
  updateUserBadge();
}

async function loadAchievements() {
  try {
    const tokenQuery = authState.token ? `&token=${encodeURIComponent(authState.token)}` : '';
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=list${tokenQuery}`, {
      method: 'GET',
    });
    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      achievements = json.data;
    } else {
      achievements = [];
    }
  } catch (error) {
    achievements = [];
    console.warn('Failed to load achievements:', error.message);
  }
  renderHomeGrid();
  if (authState.isAuthenticated) renderManageList();
}

function showPage(page) {
  document.querySelectorAll('[id^="page-"]').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.remove('hidden');
  window.scrollTo(0, 0);
  if (page === 'manage') renderManageList();
  if (page === 'record') initRecordForm();
}

function toggleEmailField() {
  const dept = document.getElementById('login-dept')?.value;
  const emailWrap = document.getElementById('login-email-wrap');
  const otherWrap = document.getElementById('login-other-dept-wrap');
  if (emailWrap) emailWrap.classList.toggle('hidden', dept === 'Admin');
  if (otherWrap) otherWrap.classList.toggle('hidden', dept !== 'อื่นๆ');
}

function filterAchievements() {
  renderHomeGrid();
}

async function handleLogin(event) {
  event.preventDefault();
  const dept = document.getElementById('login-dept')?.value;
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const errorEl = document.getElementById('login-error');
  if (errorEl) errorEl.classList.add('hidden');

  if (!dept) {
    if (errorEl) {
      errorEl.textContent = 'กรุณาเลือกหน่วยงาน';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  try {
    const result = await login({ email, password, dept });
    authState = {
      isAuthenticated: true,
      email: result.email,
      dept: result.dept,
      token: result.token,
      isAdmin: result.isAdmin,
      loading: false,
    };
    setAuthUI();
    showToast('เข้าสู่ระบบสำเร็จ', 'success');
    await loadAchievements();
    showPage('manage');
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = error.message;
      errorEl.classList.remove('hidden');
    }
  }
}

function handleLogout() {
  logout();
  authState = {
    isAuthenticated: false,
    email: null,
    dept: null,
    token: null,
    isAdmin: false,
    loading: false,
  };
  setAuthUI();
  showToast('ออกจากระบบแล้ว', 'info');
  showPage('home');
}

function renderHomeGrid() {
  const grid = document.getElementById('achievement-grid');
  if (!grid) return;

  const search = document.getElementById('search-input')?.value.toLowerCase() || '';
  const levelFilter = document.getElementById('filter-level')?.value || '';

  const filtered = achievements.filter(item => {
    const matchesSearch = !search || JSON.stringify(item).toLowerCase().includes(search);
    const matchesLevel = !levelFilter || item.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const pageData = paginate(filtered, currentPage);
  if (pageData.items.length === 0) {
    grid.innerHTML = `
      <div class="text-center text-pink-300 py-16 col-span-full">
        <i data-lucide="trophy" style="width:48px;height:48px;margin:0 auto 12px;"></i>
        <p class="text-lg">ยังไม่มีผลงานในระบบ</p>
        <p class="text-sm">เข้าสู่ระบบเพื่อเริ่มบันทึกผลงาน</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = pageData.items
    .map((item, index) => {
      const colors = {
        'นานาชาติ': 'bg-red-100 text-red-700',
        'ชาติ': 'bg-orange-100 text-orange-700',
        'ภาค(เทียบเท่าชาติ)': 'bg-yellow-100 text-yellow-700',
        'ภาค': 'bg-blue-100 text-blue-700',
        'จังหวัด': 'bg-green-100 text-green-700',
        'เขตพื้นที่การศึกษา': 'bg-cyan-100 text-cyan-700',
      };
      const badge = colors[item.level] || 'bg-gray-100 text-gray-700';
      return `
        <div class="bg-white rounded-xl border border-pink-100 p-5 card-hover cursor-pointer" onclick="showDetail(${(currentPage - 1) * PAGE_SIZE + index})">
          <div class="flex justify-between items-start mb-3">
            <span class="badge ${badge}">${item.level || '-'}</span>
            <span class="text-xs text-gray-400">${item.year || ''}</span>
          </div>
          <h3 class="font-heading font-semibold text-gray-800 mb-2 line-clamp-2">${item.project || '-'}</h3>
          <p class="text-sm text-gray-500 mb-3">${item.org || ''}${item.place ? ' • ' + item.place : ''}</p>
          <div class="flex items-center gap-2 text-xs text-pink-400">
            <i data-lucide="award" style="width:12px;height:12px;"></i> ${item.competitions?.length || 0} รายการ
          </div>
        </div>
      `;
    })
    .join('');

  lucide.createIcons();
}

function showDetail(index) {
  const item = achievements[index];
  const titleEl = document.getElementById('detail-title');
  const content = document.getElementById('detail-content');
  if (!content || !titleEl) return;
  if (!item) {
    titleEl.textContent = 'ไม่พบรายละเอียด';
    content.innerHTML = '<p class="text-gray-500">ขออภัย ไม่พบข้อมูลผลงานนี้</p>';
    document.getElementById('detail-modal')?.classList.remove('hidden');
    return;
  }

  titleEl.textContent = item.project || '-';

  let html = `
    <div class="space-y-4 text-sm text-gray-700">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pink-50 rounded-3xl p-4 border border-pink-100">
        <div><span class="text-gray-400">ปีการศึกษา:</span> <strong class="text-gray-900">${item.year || '-'}</strong></div>
        <div><span class="text-gray-400">ระดับ:</span> <strong class="text-gray-900">${item.level || '-'}</strong></div>
        <div><span class="text-gray-400">หน่วยงาน:</span> ${item.org || '-'}</div>
        <div><span class="text-gray-400">สถานที่:</span> ${item.place || '-'}</div>
      </div>
  `;

  if (item.competitions?.length) {
    html += item.competitions
      .map((comp, idx) => `
        <div class="border-t border-pink-100 pt-3 mt-3">
          <h4 class="font-semibold text-pink-700">${comp.name || `รายการที่ ${idx + 1}`}</h4>
          <p class="text-xs text-gray-500">${comp.medal || 'ระดับไม่ระบุ'} • ${comp.award || 'รางวัลไม่ระบุ'}</p>
        </div>
      `)
      .join('');
  }

  if (item.fileUrls?.length) {
    html += `
      <div class="border-t border-pink-100 pt-3 mt-3">
        <h4 class="font-semibold text-pink-700">ไฟล์แนบ</h4>
        <ul class="list-disc pl-5 text-sm text-gray-600">
          ${item.fileUrls.map(url => `<li><a href="${url}" target="_blank" class="text-pink-600 hover:underline">เปิดไฟล์แนบ</a></li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (!item.fileUrls?.length && !item.competitions?.length) {
    html += `
      <div class="border-t border-pink-100 pt-3 mt-3 text-gray-500">ไม่มีข้อมูลเพิ่มเติมสำหรับผลงานนี้</div>
    `;
  }

  html += '</div>';
  content.innerHTML = html;
  document.getElementById('detail-modal')?.classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('detail-modal')?.classList.add('hidden');
}

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!container) return;

  let filtered = achievements;
  if (!authState.isAdmin) {
    filtered = achievements.filter(item => item.recordedBy === authState.email || item.recordedDept === authState.dept);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="text-center text-pink-300 py-12"><p>ยังไม่มีผลงานที่บันทึก</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map((item, index) => {
      const related = item.recordedDept === authState.dept || item.recordedBy === authState.email ? 'เกี่ยวข้องกับหน่วยงานของคุณ' : '';
      return `
        <div class="bg-white rounded-xl border border-pink-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-3">
          <div class="flex-1 cursor-pointer" onclick="showDetail(${achievements.indexOf(item)})">
            <h4 class="font-semibold text-gray-800">${item.project || '-'}</h4>
            <p class="text-sm text-gray-500">${item.level || '-'} • ${item.year || '-'} • ${item.org || ''}</p>
            ${related ? `<p class="text-xs text-pink-500 mt-2">${related}</p>` : ''}
          </div>
          <button onclick="showDetail(${achievements.indexOf(item)})" class="px-3 py-1.5 text-xs rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50">ดู</button>
        </div>
      `;
    })
    .join('');
}

function initRecordForm() {
  const form = document.getElementById('record-form');
  if (!form) return;
  form.reset();
  selectedFiles = [];
  document.getElementById('file-preview').innerHTML = '';
  document.getElementById('record-user-badge').textContent = authState.isAdmin ? 'Admin' : authState.dept || authState.email || '';
  addCompetitionItem();
}

function addCompetitionItem() {
  const container = document.getElementById('competition-items-container');
  if (!container) return;

  const itemIndex = container.children.length + 1;
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl border border-pink-100 p-5 mb-4 shadow-sm';
  card.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="font-semibold text-pink-700">รายการแข่งขัน ${itemIndex}</h4>
      </div>
      <button type="button" class="text-pink-500 text-sm" onclick="removeCompetitionItem(this)">ลบ</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-gray-600">ชื่อรายการแข่งขัน</label>
        <input type="text" class="input-style mt-1" name="competitionName" placeholder="เช่น การแข่งขัน...">
      </div>
      <div>
        <label class="text-sm font-medium text-gray-600">ระดับเหรียญ</label>
        <select class="select-style mt-1" name="competitionMedal">
          <option value="ไม่ระบุ">ไม่ระบุ</option>
          <option value="ทอง">ทอง</option>
          <option value="เงิน">เงิน</option>
          <option value="ทองแดง">ทองแดง</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>
    </div>
    <div class="mt-4">
      <label class="text-sm font-medium text-gray-600">รางวัลที่ได้รับ</label>
      <input type="text" class="input-style mt-1" name="competitionAward" placeholder="เช่น ชนะเลิศ">
    </div>
  `;
  container.appendChild(card);
}

function removeCompetitionItem(button) {
  const card = button.closest('div.bg-white');
  if (card) card.remove();
}

function validateFiles(input) {
  const preview = document.getElementById('file-preview');
  if (!preview) return;
  const files = Array.from(input.files || []).slice(0, 5);
  selectedFiles = files;
  preview.innerHTML = files
    .map(file => `<span class="badge bg-pink-100 text-pink-700">${file.name}</span>`)
    .join('');
}

async function handleSaveRecord(event) {
  event.preventDefault();
  if (!authState.isAuthenticated) {
    showToast('กรุณาเข้าสู่ระบบก่อนบันทึก', 'error');
    return;
  }

  const yearInput = document.getElementById('rec-year');
  const yearOther = document.getElementById('rec-year-other');
  const levelInput = document.getElementById('rec-level');
  const projectInput = document.getElementById('rec-project');
  const orgInput = document.getElementById('rec-org');
  const placeInput = document.getElementById('rec-place');
  const dateInput = document.getElementById('rec-date');

  const year = yearInput?.value || '';
  const level = levelInput?.value || '';
  const project = projectInput?.value.trim() || '';
  const org = orgInput?.value.trim() || '';
  const place = placeInput?.value.trim() || '';
  const date = dateInput?.value || '';

  if (!project) {
    showToast('กรุณากรอกชื่อโครงการ/กิจกรรม', 'error');
    return;
  }

  const competitionCards = Array.from(document.querySelectorAll('#competition-items-container > div'));
  const competitions = competitionCards.map(card => ({
    name: card.querySelector('[name="competitionName"]')?.value || '',
    medal: card.querySelector('[name="competitionMedal"]')?.value || '',
    award: card.querySelector('[name="competitionAward"]')?.value || '',
  })).filter(item => item.name || item.medal || item.award);

  const attachments = await Promise.all(selectedFiles.map(async file => ({
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    base64Data: await fileToBase64(file),
  })));

  const payload = {
    record: {
      timestamp: new Date().toISOString(),
      recordedBy: authState.email,
      recordedDept: authState.dept,
      year,
      level,
      project,
      org,
      place,
      date,
      competitions,
    },
    attachments,
  };

  try {
    const response = await fetchWithRetry(`${APPSCRIPT_URL}?action=upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: authState.token, ...payload }),
    });

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'ไม่สามารถบันทึกข้อมูลได้');
    }

    showToast('บันทึกข้อมูลสำเร็จ', 'success');
    await loadAchievements();
    showPage('manage');
  } catch (error) {
    showToast(error.message || 'เกิดข้อผิดพลาดขณะบันทึก', 'error');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string') {
        const base64 = dataUrl.split(',')[1] || '';
        resolve(base64);
      } else {
        reject(new Error('Invalid file data'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function initApp() {
  try {
    const result = await autoLogin();
    if (result.success) {
      authState = {
        isAuthenticated: true,
        email: result.email,
        dept: getStoredDept(),
        token: result.token,
        isAdmin: false,
        loading: false,
      };
    } else {
      authState = {
        isAuthenticated: false,
        email: null,
        dept: null,
        token: null,
        isAdmin: false,
        loading: false,
      };
    }
  } catch (error) {
    authState.loading = false;
  }

  setAuthUI();
  await loadAchievements();
  showPage('home');
}

window.showPage = showPage;
window.toggleEmailField = toggleEmailField;
window.filterAchievements = filterAchievements;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.showDetail = showDetail;
window.closeDetailModal = closeDetailModal;
window.initRecordForm = initRecordForm;
window.addCompetitionItem = addCompetitionItem;
window.removeCompetitionItem = removeCompetitionItem;
window.validateFiles = validateFiles;
window.handleSaveRecord = handleSaveRecord;
