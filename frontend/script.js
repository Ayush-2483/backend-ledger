const API = `${window.location.origin}/api`;
const state = { accounts: [], activity: [], user: null };
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
const idLabel = (id) => `${id.slice(0, 8)}...${id.slice(-5)}`;

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = localStorage.getItem('ledgerToken');
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}
function message(id, text, success = false) { $(id).textContent = text; $(id).style.color = success ? 'var(--green)' : ''; }
function authMode(mode) {
  const register = mode === 'register';
  document.querySelectorAll('[data-mode]').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  $('nameWrap').classList.toggle('hidden', !register); $('name').required = register;
  $('authHeading').textContent = register ? 'Create your workspace' : 'Welcome back';
  $('authHint').textContent = register ? 'Create credentials to manage your ledger.' : 'Enter your credentials to continue.';
  $('authSubmit').textContent = register ? 'Create account' : 'Open dashboard';
}
function showDashboard(user) {
  state.user = user; $('userName').textContent = user.name; $('userEmail').textContent = user.email;
  $('avatar').textContent = (user.name || user.email).split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  $('authScreen').classList.add('hidden'); $('appScreen').classList.remove('hidden'); $('fundsNav').classList.toggle('hidden', !user.systemUser); loadAccounts(); loadHistory();
}
async function loadAccounts() {
  try {
    const data = await request('/accounts');
    state.accounts = await Promise.all((data.accounts || []).map(async (account) => ({ ...account, balance: (await request(`/accounts/balance/${account._id}`)).balance })));
    renderAccounts();
    loadHistory();
  } catch (error) { message('notice', error.message); }
}
function accountMarkup(account) { return `<div class="account-row"><div><strong>${idLabel(account._id)}</strong><small>${account.currency || 'INR'} · ${account.status}</small></div><span class="balance">${money(account.balance)}</span></div>`; }
function renderAccounts() {
  $('accountCount').textContent = state.accounts.length; $('totalBalance').textContent = money(state.accounts.reduce((sum, item) => sum + item.balance, 0));
  const html = state.accounts.length ? state.accounts.map(accountMarkup).join('') : '<p class="muted">No accounts yet.</p>';
  $('accountsList').innerHTML = html; $('overviewAccounts').innerHTML = html;
  $('fromAccount').innerHTML = '<option value="">Select source account</option>' + state.accounts.filter((x) => x.status === 'ACTIVE').map((x) => `<option value="${x._id}">${idLabel(x._id)} · ${money(x.balance)}</option>`).join('');
}
async function loadHistory() {
  try {
    const data = await request('/transactions');
    const ownIds = new Set(state.accounts.map((account) => account._id));
    const rows = data.transactions || [];
    $('historyList').innerHTML = rows.length ? rows.map((item) => {
      const incoming = ownIds.has(item.toAccount?._id);
      const direction = incoming ? 'Received funds' : 'Sent funds';
      const sign = incoming ? '+' : '-';
      return `<div class="history-row"><div><strong>${direction}</strong><small>${new Date(item.createdAt).toLocaleString()} · ${item.idempotencyKey}</small></div><span class="history-amount ${incoming ? 'incoming' : 'outgoing'}">${sign}${money(item.amount)}</span><span class="status">${item.status}</span></div>`;
    }).join('') : '<p class="muted">No transactions yet.</p>';
  } catch (error) { $('historyList').innerHTML = `<p class="muted">${error.message}</p>`; }
}
function addActivity(label, amount, status = 'COMPLETED') { state.activity.unshift({ label, amount, status }); $('activity').innerHTML = state.activity.slice(0, 6).map((x) => `<div class="activity-row"><div><strong>${x.label}</strong><small>${x.status} · just now</small></div><span class="balance">${money(x.amount)}</span></div>`).join(''); $('lastAmount').textContent = money(amount); $('lastStatus').textContent = status; }

document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => authMode(button.dataset.mode)));
$('authForm').addEventListener('submit', async (event) => { event.preventDefault(); const register = !$('nameWrap').classList.contains('hidden'); try { const data = await request(register ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value, ...(register ? { name: $('name').value } : {}) }) }); localStorage.setItem('ledgerToken', data.token); localStorage.setItem('ledgerUser', JSON.stringify(data.user)); showDashboard(data.user); } catch (error) { message('authMessage', error.message); } });
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.view').forEach((view) => view.classList.remove('active-view')); $(`${button.dataset.view}`).classList.add('active-view'); document.querySelectorAll('.nav-link').forEach((item) => item.classList.toggle('active', item === button)); $('viewTitle').textContent = button.querySelector('span').textContent; }));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => document.querySelector('[data-view="accounts"]').click()));
$('refresh').addEventListener('click', () => { loadAccounts(); loadHistory(); }); $('historyRefresh').addEventListener('click', loadHistory); $('createAccount').addEventListener('click', async () => { try { await request('/accounts', { method: 'POST', body: '{}' }); await loadAccounts(); message('notice', 'New account created.', true); } catch (error) { message('notice', error.message); } });
$('transferForm').addEventListener('submit', async (event) => { event.preventDefault(); try { const amount = Number($('transferAmount').value); const data = await request('/transactions', { method: 'POST', body: JSON.stringify({ fromAccount: $('fromAccount').value, toAccount: $('toAccount').value.trim(), amount, idempotencyKey: crypto.randomUUID() }) }); addActivity('Funds sent', amount, data.transaction?.status); await loadAccounts(); event.target.reset(); message('transferMessage', 'Transfer completed. Email notification sent.', true); } catch (error) { message('transferMessage', error.message); } });
$('fundsForm').addEventListener('submit', async (event) => { event.preventDefault(); try { const amount = Number($('fundsAmount').value); const data = await request('/transactions/system/initial-funds', { method: 'POST', body: JSON.stringify({ toAccount: $('fundsAccount').value.trim(), amount, idempotencyKey: crypto.randomUUID() }) }); addActivity('Initial funds added', amount, data.transaction?.status); await loadAccounts(); event.target.reset(); message('fundsMessage', 'Funds added. Recipient email notification sent.', true); } catch (error) { message('fundsMessage', error.message); } });
async function logout() { try { await request('/auth/logout', { method: 'POST' }); } catch (_) {} localStorage.removeItem('ledgerToken'); localStorage.removeItem('ledgerUser'); location.reload(); }
setInterval(() => { if (!document.getElementById('appScreen').classList.contains('hidden')) { loadAccounts(); loadHistory(); } }, 15000);
$('logout').addEventListener('click', logout); $('mobileLogout').addEventListener('click', logout); authMode('login');

window.addEventListener('focus', loadAccounts);

const savedToken = localStorage.getItem('ledgerToken');
const savedUser = localStorage.getItem('ledgerUser');
if (savedToken && savedUser) {
  try { showDashboard(JSON.parse(savedUser)); } catch (_) { localStorage.removeItem('ledgerToken'); localStorage.removeItem('ledgerUser'); }
}
