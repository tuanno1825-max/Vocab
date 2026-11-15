const state = {
  user: null,
  authMode: 'login',
  topics: [],
  activeTopicId: null,
  words: [],
  basketWords: [],
  viewMode: window.innerWidth < 900 ? 'cards' : 'table',
  filterMode: 'all',
  searchQuery: '',
  flashcards: [],
  fcIndex: 0,
  fcFlipped: false,
  test: {
    items: [],
    mode: 'quiz',
    index: 0,
    correctIds: [],
    wrongItems: [],
    answered: false,
  },
};

const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function api(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Đã có lỗi xảy ra.');
  }
  return data;
}

function speakEnglish(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

// --- Mobile Drawer ---
function openDrawer() {
  $('sidebar').classList.add('open');
  $('drawer-backdrop').classList.remove('hidden');
}

function closeDrawer() {
  $('sidebar').classList.remove('open');
  $('drawer-backdrop').classList.add('hidden');
}

// --- Modals ---
function openModal(id) {
  $(id).classList.remove('hidden');
}

function closeModal(id) {
  $(id).classList.add('hidden');
}

// --- Auth ---
function setAuthMode(mode) {
  state.authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.authMode === mode);
  });
  $('auth-submit-btn').textContent = mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản';
  $('auth-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('auth-error').classList.add('hidden');
}

async function checkSession() {
  try {
    const me = await api('/api/auth/me');
    if (me.user) {
      state.user = me.user;
      showApp();
    } else {
      showAuth();
    }
  } catch {
    showAuth();
  }
}

function showAuth() {
  $('auth-view').classList.remove('hidden');
  $('app-view').classList.add('hidden');
}

async function showApp() {
  $('auth-view').classList.add('hidden');
  $('app-view').classList.remove('hidden');
  $('user-display-name').textContent = state.user.username;
  $('user-avatar').textContent = state.user.username.charAt(0).toUpperCase();
  const isAdmin = state.user.role === 'admin';
  $('user-role-label').textContent = isAdmin ? 'Quản trị viên' : 'Tài khoản cá nhân';
  $('open-admin-btn').classList.toggle('hidden', !isAdmin);
  await Promise.all([loadTopics(), loadBasket()]);
}

async function loadBasket() {
  const data = await api('/api/words/basket');
  state.basketWords = data.words || [];
  $('basket-count').textContent = String(state.basketWords.length);
  $('basket-modal-count').textContent = `${state.basketWords.length} từ`;
}

// --- Topics ---
async function loadTopics() {
  const data = await api('/api/topics');
  state.topics = data.topics;

  if (state.topics.length === 0) {
    state.activeTopicId = null;
  } else if (!state.topics.some((t) => t.id === state.activeTopicId)) {
    state.activeTopicId = state.topics[0].id;
  }

  renderTopics();
  await loadWords();
}

function renderTopics() {
  const listEl = $('topic-list');
  if (state.topics.length === 0) {
    listEl.innerHTML = `<p style="padding: 12px; font-size: 13px; color: var(--text-muted);">Chưa có topic nào. Bấm <b>+ Topic</b> để tạo.</p>`;
  } else {
    listEl.innerHTML = state.topics
      .map(
        (t) => `
      <button type="button" class="topic-item ${t.id === state.activeTopicId ? 'active' : ''}" data-topic-id="${escapeHtml(t.id)}">
        <span class="topic-name">${escapeHtml(t.name)}</span>
        <span class="topic-count">${t.wordCount}</span>
      </button>
    `
      )
      .join('');
  }

  const active = state.topics.find((t) => t.id === state.activeTopicId);
  $('current-topic-title').textContent = active ? active.name : 'Chưa chọn Topic';
  $('current-topic-desc').textContent = active?.description || '';
  $('edit-topic-btn').disabled = !active;
  $('delete-topic-btn').disabled = !active;
  $('add-word-btn').disabled = state.topics.length === 0;
  $('bulk-import-btn').disabled = state.topics.length === 0;
}

async function selectTopic(topicId) {
  state.activeTopicId = topicId;
  renderTopics();
  closeDrawer();
  await loadWords();
}

// --- Words ---
async function loadWords() {
  if (!state.activeTopicId) {
    state.words = [];
    renderWords();
    return;
  }
  const params = new URLSearchParams({ topicId: String(state.activeTopicId) });
  if (state.searchQuery.trim()) {
    params.set('q', state.searchQuery.trim());
  }
  const data = await api(`/api/words?${params.toString()}`);
  state.words = data.words;
  renderWords();
}

function toneTag(tone) {
  if (tone === 'negative') return '<span class="tag tag-neg">(-) tiêu cực</span>';
  if (tone === 'positive') return '<span class="tag tag-pos">(+) tích cực</span>';
  return '';
}

function formatFamilyItem(f) {
  const prep = f.prep ? ` ${escapeHtml(f.prep)}` : '';
  return `<div class="item-line"><span><strong>${escapeHtml(f.word)}</strong> (${escapeHtml(f.pos)})${prep}</span>${toneTag(f.tone)}</div>`;
}

function formatCollocationItem(c) {
  return `<div class="item-line"><span>${escapeHtml(c.phrase)}</span>${toneTag(c.tone)}</div>`;
}

function formatSynonymItem(s) {
  const lvl = s.level ? ` (${escapeHtml(s.level)})` : '';
  return `<span class="tag">${escapeHtml(s.word)}${lvl}</span>`;
}

function basketButtonHtml(w) {
  return `<button type="button" class="mastered-btn ${w.inTestBasket ? 'is-mastered' : ''}" data-toggle-basket="${escapeHtml(w.id)}" title="Thêm hoặc bỏ khỏi Giỏ Test riêng">
    ${w.inTestBasket ? '✓ Trong giỏ' : '🛒 + Giỏ Test'}
  </button>`;
}

function getFilteredWords() {
  if (state.filterMode === 'basket') return state.words.filter((w) => w.inTestBasket);
  return state.words;
}

function renderWords() {
  const visibleWords = getFilteredWords();
  $('word-count-badge').textContent = `${visibleWords.length}/${state.words.length} từ`;
  const container = $('words-container');

  if (!state.activeTopicId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Chưa có Topic nào</h3>
        <p>Hãy tạo Topic đầu tiên (vd: <b>Hôm nay</b>, <b>IELTS Environment</b>) để bắt đầu lưu từ vựng.</p>
      </div>
    `;
    return;
  }

  if (visibleWords.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${state.words.length === 0 ? 'Topic này chưa có từ vựng' : 'Không có từ nào trong bộ lọc này'}</h3>
        <p>${state.words.length === 0 ? 'Bấm nút <b>+ Thêm từ</b> hoặc <b>📥 Nhập nhanh</b> để thêm từ mới.' : 'Thử chuyển sang mục <b>Tất cả</b> để xem toàn bộ từ.'}</p>
      </div>
    `;
    return;
  }

  const effectiveView = window.innerWidth < 900 ? 'cards' : state.viewMode;

  if (effectiveView === 'table') {
    container.innerHTML = `
      <div class="vocab-table-wrap">
        <table class="vocab-table">
          <thead>
            <tr>
              <th>TỪ MỚI</th>
              <th>NGHĨA</th>
              <th>TỪ ĐỒNG NGHĨA</th>
              <th>COLLOCATION</th>
              <th>HỌ TỪ</th>
              <th>EXAMPLE</th>
              <th>GIỎ TEST</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${visibleWords
              .map(
                (w) => `
              <tr>
                <td>
                  <div class="word-title-row">
                    <span class="word-main">${escapeHtml(w.word)}</span>
                    <span class="tag">${escapeHtml(w.pos)}</span>
                    <span class="tag tag-level">${escapeHtml(w.level)}</span>
                    <button type="button" class="speak-btn" data-speak="${escapeHtml(w.word)}" title="Nghe phát âm">🔊</button>
                  </div>
                  ${w.ipa ? `<div class="ipa-text">${escapeHtml(w.ipa)}</div>` : ''}
                </td>
                <td>${escapeHtml(w.meaning)}</td>
                <td>
                  <div class="item-line">${w.synonyms.length ? w.synonyms.map(formatSynonymItem).join('') : '<span class="ipa-text">—</span>'}</div>
                </td>
                <td>
                  <div class="item-stack">${w.collocations.length ? w.collocations.map(formatCollocationItem).join('') : '<span class="ipa-text">—</span>'}</div>
                </td>
                <td>
                  <div class="item-stack">${w.wordFamilies.length ? w.wordFamilies.map(formatFamilyItem).join('') : '<span class="ipa-text">—</span>'}</div>
                </td>
                <td style="max-width: 260px;">
                  ${
                    w.example
                      ? `<div class="item-line"><span>${escapeHtml(w.example)}</span> <button type="button" class="speak-btn" data-speak="${escapeHtml(w.example)}" title="Nghe câu ví dụ">🔊</button></div>`
                      : '<span class="ipa-text">—</span>'
                  }
                </td>
                <td>${basketButtonHtml(w)}</td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="icon-btn" data-edit-word="${escapeHtml(w.id)}" title="Sửa">✏️</button>
                    <button type="button" class="icon-btn danger" data-delete-word="${escapeHtml(w.id)}" title="Xóa">🗑️</button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="vocab-cards">
        ${visibleWords
          .map(
            (w) => `
          <article class="vocab-card">
            <div class="vocab-card-head">
              <div>
                <div class="word-title-row">
                  <span class="word-main">${escapeHtml(w.word)}</span>
                  <span class="tag">${escapeHtml(w.pos)}</span>
                  <span class="tag tag-level">${escapeHtml(w.level)}</span>
                  <button type="button" class="speak-btn" data-speak="${escapeHtml(w.word)}" title="Nghe phát âm">🔊</button>
                </div>
                ${w.ipa ? `<div class="ipa-text">${escapeHtml(w.ipa)}</div>` : ''}
              </div>
              <div class="row-actions">
                ${basketButtonHtml(w)}
                <button type="button" class="icon-btn" data-edit-word="${escapeHtml(w.id)}" title="Sửa">✏️</button>
                <button type="button" class="icon-btn danger" data-delete-word="${escapeHtml(w.id)}" title="Xóa">🗑️</button>
              </div>
            </div>

            <div class="vocab-card-meaning">${escapeHtml(w.meaning)}</div>

            ${
              w.synonyms.length
                ? `<div class="card-section">
                    <span class="card-section-label">Từ đồng nghĩa</span>
                    <div class="item-line">${w.synonyms.map(formatSynonymItem).join('')}</div>
                  </div>`
                : ''
            }

            ${
              w.collocations.length
                ? `<div class="card-section">
                    <span class="card-section-label">Collocation</span>
                    <div class="item-stack">${w.collocations.map(formatCollocationItem).join('')}</div>
                  </div>`
                : ''
            }

            ${
              w.wordFamilies.length
                ? `<div class="card-section">
                    <span class="card-section-label">Họ từ</span>
                    <div class="item-stack">${w.wordFamilies.map(formatFamilyItem).join('')}</div>
                  </div>`
                : ''
            }

            ${
              w.example
                ? `<div class="card-section">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <span class="card-section-label">Example</span>
                      <button type="button" class="speak-btn" data-speak="${escapeHtml(w.example)}" title="Nghe câu ví dụ">🔊</button>
                    </div>
                    <p class="example-quote">${escapeHtml(w.example)}</p>
                  </div>`
                : ''
            }
          </article>
        `
          )
          .join('')}
      </div>
    `;
  }
}

// --- Repeater Row Builders ---
function addSynonymRow(item = { word: '', level: 'B1' }) {
  const row = document.createElement('div');
  row.className = 'repeater-row';
  row.innerHTML = `
    <input type="text" class="syn-word" placeholder="Từ đồng nghĩa (vd: depend)" value="${escapeHtml(item.word)}" />
    <input type="text" class="syn-level prep-input" placeholder="Level (B1)" value="${escapeHtml(item.level)}" />
    <button type="button" class="icon-btn danger remove-row-btn" title="Xóa dòng">✕</button>
  `;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  $('synonyms-list').appendChild(row);
}

function addCollocationRow(item = { phrase: '', tone: 'neutral' }) {
  const row = document.createElement('div');
  row.className = 'repeater-row';
  row.innerHTML = `
    <input type="text" class="col-phrase" placeholder="Cụm từ (vd: rely on sth/sb)" value="${escapeHtml(item.phrase)}" />
    <select class="col-tone">
      <option value="neutral" ${item.tone === 'neutral' ? 'selected' : ''}>Bình thường</option>
      <option value="negative" ${item.tone === 'negative' ? 'selected' : ''}>(-) Tiêu cực</option>
      <option value="positive" ${item.tone === 'positive' ? 'selected' : ''}>(+) Tích cực</option>
    </select>
    <button type="button" class="icon-btn danger remove-row-btn" title="Xóa dòng">✕</button>
  `;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  $('collocations-list').appendChild(row);
}

function addFamilyRow(item = { word: '', pos: 'n', prep: '', tone: 'neutral' }) {
  const row = document.createElement('div');
  row.className = 'repeater-row';
  row.innerHTML = `
    <input type="text" class="fam-word" placeholder="Họ từ (vd: reliance)" value="${escapeHtml(item.word)}" />
    <select class="fam-pos">
      <option value="n" ${item.pos === 'n' ? 'selected' : ''}>n</option>
      <option value="v" ${item.pos === 'v' ? 'selected' : ''}>v</option>
      <option value="adj" ${item.pos === 'adj' ? 'selected' : ''}>adj</option>
      <option value="adv" ${item.pos === 'adv' ? 'selected' : ''}>adv</option>
      <option value="phrase" ${item.pos === 'phrase' ? 'selected' : ''}>cụm</option>
    </select>
    <input type="text" class="fam-prep prep-input" placeholder="Giới từ (on)" value="${escapeHtml(item.prep)}" />
    <select class="fam-tone">
      <option value="neutral" ${item.tone === 'neutral' ? 'selected' : ''}>Bình thường</option>
      <option value="negative" ${item.tone === 'negative' ? 'selected' : ''}>(-) Tiêu cực</option>
      <option value="positive" ${item.tone === 'positive' ? 'selected' : ''}>(+) Tích cực</option>
    </select>
    <button type="button" class="icon-btn danger remove-row-btn" title="Xóa dòng">✕</button>
  `;
  row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove());
  $('families-list').appendChild(row);
}

function openWordModal(wordObj = null) {
  $('word-topic-select').innerHTML = state.topics
    .map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`)
    .join('');

  $('synonyms-list').innerHTML = '';
  $('collocations-list').innerHTML = '';
  $('families-list').innerHTML = '';

  if (wordObj) {
    $('word-modal-title').textContent = 'Chỉnh sửa từ vựng';
    $('word-id-input').value = wordObj.id;
    $('word-topic-select').value = String(wordObj.topicId);
    $('word-text-input').value = wordObj.word;
    $('word-pos-select').value = wordObj.pos || 'v';
    $('word-level-select').value = wordObj.level || 'B2';
    $('word-ipa-input').value = wordObj.ipa || '';
    $('word-meaning-input').value = wordObj.meaning;
    $('word-example-input').value = wordObj.example || '';

    wordObj.synonyms.forEach(addSynonymRow);
    wordObj.collocations.forEach(addCollocationRow);
    wordObj.wordFamilies.forEach(addFamilyRow);
  } else {
    $('word-modal-title').textContent = 'Thêm từ vựng mới';
    $('word-id-input').value = '';
    $('word-topic-select').value = String(state.activeTopicId || state.topics[0]?.id || '');
    $('word-text-input').value = '';
    $('word-pos-select').value = 'v';
    $('word-level-select').value = 'B2';
    $('word-ipa-input').value = '';
    $('word-meaning-input').value = '';
    $('word-example-input').value = '';

    addCollocationRow();
    addFamilyRow();
  }

  openModal('word-modal');
}

// --- Flashcard Mode ---
function buildFlashcardsList() {
  const onlyUnmastered = $('fc-only-unmastered').checked;
  const list = onlyUnmastered ? state.words.filter((w) => !w.mastered) : [...state.words];
  state.flashcards = list;
  state.fcIndex = 0;
  state.fcFlipped = false;
}

function openFlashcards() {
  if (state.words.length === 0) {
    alert('Topic này chưa có từ nào để ôn tập.');
    return;
  }
  $('fc-only-unmastered').checked = false;
  buildFlashcardsList();
  renderFlashcard();
  openModal('flashcard-modal');
}

function renderFlashcard() {
  if (state.flashcards.length === 0) {
    $('fc-progress').textContent = '0/0';
    $('fc-front').classList.remove('hidden');
    $('fc-back').classList.add('hidden');
    $('fc-front').innerHTML = `<div class="ipa-text" style="text-align:center;">Tuyệt vời! Bạn đã thuộc hết các từ trong topic này.</div>`;
    $('fc-toggle-mastered-btn').disabled = true;
    $('fc-speak-btn').disabled = true;
    return;
  }

  $('fc-toggle-mastered-btn').disabled = false;
  $('fc-speak-btn').disabled = false;
  const w = state.flashcards[state.fcIndex];
  $('fc-progress').textContent = `${state.fcIndex + 1}/${state.flashcards.length}`;
  $('fc-front').classList.toggle('hidden', state.fcFlipped);
  $('fc-back').classList.toggle('hidden', !state.fcFlipped);

  $('fc-toggle-mastered-btn').textContent = w.mastered ? '✓ Đã thuộc' : '○ Đánh dấu đã thuộc';
  $('fc-toggle-mastered-btn').classList.toggle('tag-pos', w.mastered);

  $('fc-front').innerHTML = `
    <div class="fc-word-big">${escapeHtml(w.word)}</div>
    <div class="fc-center-meta">
      <span class="tag">${escapeHtml(w.pos)}</span>
      <span class="tag tag-level">${escapeHtml(w.level)}</span>
      ${w.ipa ? `<span class="ipa-text">${escapeHtml(w.ipa)}</span>` : ''}
    </div>
  `;

  $('fc-back').innerHTML = `
    <div class="vocab-card-meaning" style="text-align:center;">${escapeHtml(w.meaning)}</div>
    ${w.synonyms.length ? `<div><strong>Từ dễ tương đương:</strong> ${w.synonyms.map((s) => `${escapeHtml(s.word)}${s.level ? ` (${escapeHtml(s.level)})` : ''}`).join(', ')}</div>` : ''}
    ${w.collocations.length ? `<div><strong>Collocation:</strong> ${w.collocations.map((c) => escapeHtml(c.phrase)).join(' • ')}</div>` : ''}
    ${w.wordFamilies.length ? `<div><strong>Họ từ:</strong> ${w.wordFamilies.map((f) => `${escapeHtml(f.word)} (${escapeHtml(f.pos)})`).join(', ')}</div>` : ''}
    ${w.example ? `<p class="example-quote">${escapeHtml(w.example)}</p>` : ''}
  `;
}

// --- Test Mode ---
function updateTestSelectedCount() {
  const checked = $('test-word-checklist').querySelectorAll('input[type="checkbox"]:checked').length;
  $('test-selected-count').textContent = String(checked);
}

function openTestModal() {
  if (state.words.length === 0) {
    alert('Topic này chưa có từ nào để kiểm tra.');
    return;
  }

  state.test.sourcePool = state.words;
  const hasBasketInTopic = state.words.some((w) => w.inTestBasket);

  $('test-setup-step').classList.remove('hidden');
  $('test-run-step').classList.add('hidden');
  $('test-result-step').classList.add('hidden');
  $('test-progress-badge').classList.add('hidden');

  $('test-word-checklist').innerHTML = state.words
    .map(
      (w) => `
    <label class="test-check-item">
      <span class="test-check-left">
        <input type="checkbox" value="${escapeHtml(w.id)}" ${hasBasketInTopic ? (w.inTestBasket ? 'checked' : '') : 'checked'} />
        <span><strong>${escapeHtml(w.word)}</strong> <small class="ipa-text">— ${escapeHtml(w.meaning)}</small></span>
      </span>
      <span class="tag ${w.inTestBasket ? 'tag-pos' : ''}">${w.inTestBasket ? 'Trong giỏ' : 'Bình thường'}</span>
    </label>
  `
    )
    .join('');

  updateTestSelectedCount();
  openModal('test-modal');
}

function openBasketTestModal() {
  if (state.basketWords.length === 0) {
    alert('Giỏ Test đang trống. Hãy bấm "+ Giỏ Test" ở những từ bạn chưa chắc chắn.');
    return;
  }

  state.test.sourcePool = state.basketWords;
  $('test-setup-step').classList.remove('hidden');
  $('test-run-step').classList.add('hidden');
  $('test-result-step').classList.add('hidden');
  $('test-progress-badge').classList.add('hidden');

  $('test-word-checklist').innerHTML = state.basketWords
    .map(
      (w) => `
    <label class="test-check-item">
      <span class="test-check-left">
        <input type="checkbox" value="${escapeHtml(w.id)}" checked />
        <span><strong>${escapeHtml(w.word)}</strong> <small class="ipa-text">— ${escapeHtml(w.meaning)}</small></span>
      </span>
      <span class="tag tag-pos">Trong giỏ</span>
    </label>
  `
    )
    .join('');

  updateTestSelectedCount();
  closeModal('basket-modal');
  openModal('test-modal');
}

function renderBasketModal() {
  $('basket-modal-count').textContent = `${state.basketWords.length} từ`;
  if (state.basketWords.length === 0) {
    $('basket-list').innerHTML = `<p style="padding: 16px; text-align:center; color: var(--text-muted); font-size: 13px;">Giỏ Test đang trống. Hãy bấm nút <b>🛒 + Giỏ Test</b> trên các từ bạn muốn ôn riêng.</p>`;
    $('start-basket-test-btn').disabled = true;
    $('clear-basket-btn').disabled = true;
    return;
  }
  $('start-basket-test-btn').disabled = false;
  $('clear-basket-btn').disabled = false;
  $('basket-list').innerHTML = state.basketWords
    .map(
      (w) => `
    <div class="test-check-item">
      <span class="test-check-left">
        <button type="button" class="speak-btn" data-speak="${escapeHtml(w.word)}" title="Nghe phát âm">🔊</button>
        <span><strong>${escapeHtml(w.word)}</strong> <span class="tag">${escapeHtml(w.pos)}</span> <small class="ipa-text">— ${escapeHtml(w.meaning)}</small></span>
      </span>
      <button type="button" class="btn btn-sm btn-ghost" style="color: var(--danger);" data-remove-basket="${escapeHtml(w.id)}" title="Bỏ khỏi giỏ">✕</button>
    </div>
  `
    )
    .join('');
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startTest() {
  const selectedIds = [...$('test-word-checklist').querySelectorAll('input[type="checkbox"]:checked')].map(
    (cb) => cb.value
  );
  if (selectedIds.length === 0) {
    alert('Vui lòng tick ít nhất 1 từ để bắt đầu Test.');
    return;
  }

  const pool = state.test.sourcePool || state.words;
  const selectedWords = pool.filter((w) => selectedIds.includes(w.id));
  const mode = document.querySelector('input[name="test-mode"]:checked')?.value || 'quiz';

  state.test = {
    sourcePool: pool,
    items: shuffleArray(selectedWords),
    mode: mode === 'quiz' && pool.length < 2 ? 'type' : mode,
    index: 0,
    correctIds: [],
    wrongItems: [],
    answered: false,
  };

  $('test-setup-step').classList.add('hidden');
  $('test-result-step').classList.add('hidden');
  $('test-run-step').classList.remove('hidden');
  $('test-progress-badge').classList.remove('hidden');
  renderTestQuestion();
}

function makeBlankSentence(wordText, example) {
  if (!example) return { blanked: null, expected: wordText };
  const variants = wordText
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const variant of variants) {
    const escaped = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(example)) {
      return {
        blanked: example.replace(regex, '______'),
        expected: variant,
      };
    }
  }
  return { blanked: null, expected: variants[0] || wordText };
}

function renderTestQuestion() {
  const { items, index, mode } = state.test;
  const current = items[index];
  state.test.answered = false;

  $('test-progress-badge').textContent = `${index + 1}/${items.length}`;
  $('test-feedback').classList.add('hidden');
  $('test-next-btn').classList.add('hidden');

  if (mode === 'quiz') {
    $('test-q-meaning').textContent = current.meaning;
    $('test-q-hint').textContent = `Gợi ý: (${current.pos}) • ${current.level}`;
    $('test-quiz-options').classList.remove('hidden');
    $('test-type-form').classList.add('hidden');

    const pool = state.test.sourcePool || state.words;
    const distractors = shuffleArray(pool.filter((w) => w.id !== current.id)).slice(0, 3);
    const options = shuffleArray([current, ...distractors]);

    $('test-quiz-options').innerHTML = options
      .map(
        (opt) => `
      <button type="button" class="test-opt-btn" data-opt-id="${escapeHtml(opt.id)}">
        ${escapeHtml(opt.word)}
      </button>
    `
      )
      .join('');
  } else if (mode === 'blank') {
    const { blanked, expected } = makeBlankSentence(current.word, current.example);
    state.test.expectedBlank = expected;
    if (blanked) {
      $('test-q-meaning').textContent = blanked;
      $('test-q-hint').textContent = `Nghĩa: ${current.meaning} (${current.pos})`;
    } else {
      $('test-q-meaning').textContent = current.meaning;
      $('test-q-hint').textContent = `Gợi ý: (${current.pos}) • ${current.level}`;
    }
    $('test-quiz-options').classList.add('hidden');
    $('test-type-form').classList.remove('hidden');
    $('test-type-input').value = '';
    $('test-type-input').disabled = false;
    setTimeout(() => $('test-type-input').focus(), 50);
  } else {
    $('test-q-meaning').textContent = current.meaning;
    $('test-q-hint').textContent = `Gợi ý: (${current.pos}) • ${current.level}`;
    $('test-quiz-options').classList.add('hidden');
    $('test-type-form').classList.remove('hidden');
    $('test-type-input').value = '';
    $('test-type-input').disabled = false;
    setTimeout(() => $('test-type-input').focus(), 50);
  }
}

function handleTestAnswer(isCorrect, currentWord) {
  state.test.answered = true;
  if (isCorrect) {
    state.test.correctIds.push(currentWord.id);
  } else {
    state.test.wrongItems.push(currentWord);
  }

  const fb = $('test-feedback');
  fb.classList.remove('hidden', 'ok', 'bad');
  fb.classList.add(isCorrect ? 'ok' : 'bad');
  fb.innerHTML = `
    <span>${isCorrect ? '✓ Chính xác!' : `✕ Sai rồi. Đáp án: <strong>${escapeHtml(currentWord.word)}</strong>`}</span>
    <button type="button" class="speak-btn" data-speak="${escapeHtml(currentWord.word)}" title="Nghe phát âm">🔊</button>
  `;

  $('test-next-btn').textContent =
    state.test.index + 1 < state.test.items.length ? 'Câu tiếp theo →' : 'Xem kết quả';
  $('test-next-btn').classList.remove('hidden');
}

function showTestResult() {
  $('test-run-step').classList.add('hidden');
  $('test-result-step').classList.remove('hidden');
  const total = state.test.items.length;
  const score = state.test.correctIds.length;
  $('test-score-big').textContent = `${score}/${total}`;
  $('test-score-msg').textContent =
    score === total ? 'Tuyệt vời! Bạn đã nhớ hết các từ vừa chọn.' : `Bạn làm đúng ${score} trên ${total} từ.`;

  $('test-wrong-list').innerHTML = state.test.wrongItems.length
    ? `<div class="card-section-label">Các từ cần ôn lại</div>` +
      state.test.wrongItems
        .map(
          (w) => `
        <div class="admin-user-row">
          <span><strong>${escapeHtml(w.word)}</strong> (${escapeHtml(w.pos)}) — ${escapeHtml(w.meaning)}</span>
          <button type="button" class="speak-btn" data-speak="${escapeHtml(w.word)}">🔊</button>
        </div>
      `
        )
        .join('')
    : '';

  const hasCorrectInBasket = state.test.items.some(
    (w) => w.inTestBasket && state.test.correctIds.includes(w.id)
  );
  $('test-remove-basket-btn').classList.toggle('hidden', !hasCorrectInBasket);
}

// --- Admin Modal ---
async function openAdminModal() {
  $('admin-error').classList.add('hidden');
  await loadAdminUsers();
  openModal('admin-modal');
}

async function loadAdminUsers() {
  const data = await api('/api/admin/users');
  $('admin-users-list').innerHTML = data.users
    .map(
      (u) => `
    <div class="admin-user-row">
      <div>
        <strong>${escapeHtml(u.username)}</strong>
        <span class="tag ${u.role === 'admin' ? 'tag-level' : ''}">${u.role === 'admin' ? 'Admin' : 'User'}</span>
        <div class="ipa-text">${u.topicCount} topic • ${u.wordCount} từ</div>
      </div>
      <div class="row-actions">
        <button type="button" class="btn btn-sm btn-outline" data-admin-chpass="${escapeHtml(u.id)}" data-admin-username="${escapeHtml(u.username)}">Đổi MK</button>
        ${
          u.id !== state.user.id
            ? `<button type="button" class="btn btn-sm btn-outline" style="color: var(--danger);" data-admin-del="${escapeHtml(u.id)}" data-admin-username="${escapeHtml(u.username)}">Xóa</button>`
            : ''
        }
      </div>
    </div>
  `
    )
    .join('');
}

// --- Export CSV ---
function exportCsv() {
  if (state.words.length === 0) return;
  const headers = ['TỪ MỚI', 'NGHĨA', 'TỪ ĐỒNG NGHĨA', 'COLLOCATION', 'HỌ TỪ', 'EXAMPLE'];
  const rows = state.words.map((w) => [
    `${w.word} (${w.pos}) (${w.level})`,
    w.meaning,
    w.synonyms.map((s) => (s.level ? `${s.word} (${s.level})` : s.word)).join('; '),
    w.collocations.map((c) => `${c.phrase}${c.tone === 'negative' ? ' (-)' : c.tone === 'positive' ? ' (+)' : ''}`).join('\n'),
    w.wordFamilies.map((f) => `${f.word} (${f.pos})${f.prep ? ' ' + f.prep : ''}${f.tone === 'negative' ? ' (-)' : ''}`).join('\n'),
    w.example || '',
  ]);

  const csvCell = (val) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = '\uFEFF' + [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vocab-topic-${state.activeTopicId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Event Listeners ---
$('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('auth-error').classList.add('hidden');
  const username = $('auth-username').value.trim();
  const password = $('auth-password').value;

  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    state.user = data.user;
    await showApp();
  } catch (err) {
    $('auth-error').textContent = err.message;
    $('auth-error').classList.remove('hidden');
  }
});

$('logout-btn').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null;
  state.topics = [];
  state.words = [];
  closeDrawer();
  showAuth();
});

$('open-drawer-btn').addEventListener('click', openDrawer);
$('close-drawer-btn').addEventListener('click', closeDrawer);
$('drawer-backdrop').addEventListener('click', closeDrawer);

$('topic-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-topic-id]');
  if (btn) selectTopic(btn.dataset.topicId);
});

$('new-topic-btn').addEventListener('click', () => {
  $('topic-modal-title').textContent = 'Tạo Topic mới';
  $('topic-id-input').value = '';
  $('topic-name-input').value = '';
  $('topic-desc-input').value = '';
  openModal('topic-modal');
});

$('edit-topic-btn').addEventListener('click', () => {
  const active = state.topics.find((t) => t.id === state.activeTopicId);
  if (!active) return;
  $('topic-modal-title').textContent = 'Đổi tên Topic';
  $('topic-id-input').value = active.id;
  $('topic-name-input').value = active.name;
  $('topic-desc-input').value = active.description || '';
  openModal('topic-modal');
});

$('delete-topic-btn').addEventListener('click', async () => {
  const active = state.topics.find((t) => t.id === state.activeTopicId);
  if (!active) return;
  if (!confirm(`Xóa topic "${active.name}" và toàn bộ từ vựng bên trong?`)) return;
  await api(`/api/topics/${active.id}`, { method: 'DELETE' });
  await loadTopics();
});

$('topic-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('topic-id-input').value;
  const name = $('topic-name-input').value.trim();
  const description = $('topic-desc-input').value.trim();

  if (id) {
    await api(`/api/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  } else {
    const res = await api('/api/topics', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    state.activeTopicId = res.topic.id;
  }

  closeModal('topic-modal');
  await loadTopics();
});

$('add-word-btn').addEventListener('click', () => openWordModal(null));
$('add-synonym-btn').addEventListener('click', () => addSynonymRow());
$('add-collocation-btn').addEventListener('click', () => addCollocationRow());
$('add-family-btn').addEventListener('click', () => addFamilyRow());

$('word-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('word-id-input').value;

  const synonyms = [...$('synonyms-list').querySelectorAll('.repeater-row')]
    .map((r) => ({
      word: r.querySelector('.syn-word').value.trim(),
      level: r.querySelector('.syn-level').value.trim(),
    }))
    .filter((s) => s.word);

  const collocations = [...$('collocations-list').querySelectorAll('.repeater-row')]
    .map((r) => ({
      phrase: r.querySelector('.col-phrase').value.trim(),
      tone: r.querySelector('.col-tone').value,
    }))
    .filter((c) => c.phrase);

  const wordFamilies = [...$('families-list').querySelectorAll('.repeater-row')]
    .map((r) => ({
      word: r.querySelector('.fam-word').value.trim(),
      pos: r.querySelector('.fam-pos').value,
      prep: r.querySelector('.fam-prep').value.trim(),
      tone: r.querySelector('.fam-tone').value,
    }))
    .filter((f) => f.word);

  const payload = {
    topicId: $('word-topic-select').value,
    word: $('word-text-input').value.trim(),
    pos: $('word-pos-select').value,
    level: $('word-level-select').value,
    ipa: $('word-ipa-input').value.trim(),
    meaning: $('word-meaning-input').value.trim(),
    synonyms,
    collocations,
    wordFamilies,
    example: $('word-example-input').value.trim(),
  };

  if (id) {
    await api(`/api/words/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  } else {
    await api('/api/words', { method: 'POST', body: JSON.stringify(payload) });
  }

  state.activeTopicId = payload.topicId;
  closeModal('word-modal');
  await loadTopics();
});

$('words-container').addEventListener('click', async (e) => {
  const speakBtn = e.target.closest('[data-speak]');
  if (speakBtn) {
    speakEnglish(speakBtn.dataset.speak);
    return;
  }

  const basketBtn = e.target.closest('[data-toggle-basket]');
  if (basketBtn) {
    const id = basketBtn.dataset.toggleBasket;
    const wordObj = state.words.find((w) => w.id === id);
    if (!wordObj) return;
    await api(`/api/words/${id}/basket`, {
      method: 'PATCH',
      body: JSON.stringify({ inTestBasket: !wordObj.inTestBasket }),
    });
    await Promise.all([loadWords(), loadBasket()]);
    return;
  }

  const editBtn = e.target.closest('[data-edit-word]');
  if (editBtn) {
    const wordObj = state.words.find((w) => w.id === editBtn.dataset.editWord);
    if (wordObj) openWordModal(wordObj);
    return;
  }

  const delBtn = e.target.closest('[data-delete-word]');
  if (delBtn) {
    const id = delBtn.dataset.deleteWord;
    if (!confirm('Bạn chắc chắn muốn xóa từ này?')) return;
    await api(`/api/words/${id}`, { method: 'DELETE' });
    await loadTopics();
  }
});

let searchTimer = null;
$('search-input').addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadWords, 200);
});

document.querySelectorAll('.view-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.viewMode = btn.dataset.view;
    document.querySelectorAll('.view-btn').forEach((b) => b.classList.toggle('active', b === btn));
    renderWords();
  });
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.filterMode = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.toggle('active', b === btn));
    renderWords();
  });
});

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
});

$('flashcard-btn').addEventListener('click', openFlashcards);
$('fc-only-unmastered').addEventListener('change', () => {
  buildFlashcardsList();
  renderFlashcard();
});
$('fc-speak-btn').addEventListener('click', () => {
  const w = state.flashcards[state.fcIndex];
  if (w) speakEnglish(w.word);
});
$('fc-toggle-mastered-btn').addEventListener('click', async () => {
  const w = state.flashcards[state.fcIndex];
  if (!w) return;
  const nextMastered = !w.mastered;
  await api(`/api/words/${w.id}/mastered`, {
    method: 'PATCH',
    body: JSON.stringify({ mastered: nextMastered }),
  });
  w.mastered = nextMastered;
  const inState = state.words.find((x) => x.id === w.id);
  if (inState) inState.mastered = nextMastered;
  renderWords();
  renderFlashcard();
});
$('fc-card').addEventListener('click', () => {
  state.fcFlipped = !state.fcFlipped;
  renderFlashcard();
});
$('fc-flip-btn').addEventListener('click', () => {
  state.fcFlipped = !state.fcFlipped;
  renderFlashcard();
});
$('fc-prev-btn').addEventListener('click', () => {
  state.fcIndex = (state.fcIndex - 1 + state.flashcards.length) % state.flashcards.length;
  state.fcFlipped = false;
  renderFlashcard();
});
$('fc-next-btn').addEventListener('click', () => {
  state.fcIndex = (state.fcIndex + 1) % state.flashcards.length;
  state.fcFlipped = false;
  renderFlashcard();
});

// --- Test Events ---
$('test-btn').addEventListener('click', openTestModal);
$('test-word-checklist').addEventListener('change', updateTestSelectedCount);

$('test-pick-unmastered').addEventListener('click', () => {
  const pool = state.test.sourcePool || state.words;
  const basketIds = new Set(pool.filter((w) => w.inTestBasket).map((w) => w.id));
  $('test-word-checklist').querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = basketIds.has(cb.value);
  });
  updateTestSelectedCount();
});

$('test-pick-all').addEventListener('click', () => {
  $('test-word-checklist').querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = true;
  });
  updateTestSelectedCount();
});

$('test-pick-none').addEventListener('click', () => {
  $('test-word-checklist').querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  updateTestSelectedCount();
});

$('start-test-btn').addEventListener('click', startTest);

$('test-quiz-options').addEventListener('click', (e) => {
  if (state.test.answered) return;
  const btn = e.target.closest('[data-opt-id]');
  if (!btn) return;

  const current = state.test.items[state.test.index];
  const isCorrect = btn.dataset.optId === current.id;

  $('test-quiz-options').querySelectorAll('[data-opt-id]').forEach((b) => {
    b.disabled = true;
    if (b.dataset.optId === current.id) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  handleTestAnswer(isCorrect, current);
});

$('test-type-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (state.test.answered) return;
  const current = state.test.items[state.test.index];
  const ans = $('test-type-input').value.trim().toLowerCase();
  const validAnswers = current.word
    .split('/')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  $('test-type-input').disabled = true;
  handleTestAnswer(validAnswers.includes(ans), current);
});

$('test-feedback').addEventListener('click', (e) => {
  const speakBtn = e.target.closest('[data-speak]');
  if (speakBtn) speakEnglish(speakBtn.dataset.speak);
});

$('test-wrong-list').addEventListener('click', (e) => {
  const speakBtn = e.target.closest('[data-speak]');
  if (speakBtn) speakEnglish(speakBtn.dataset.speak);
});

$('test-next-btn').addEventListener('click', () => {
  state.test.index += 1;
  if (state.test.index < state.test.items.length) {
    renderTestQuestion();
  } else {
    showTestResult();
  }
});

$('test-remove-basket-btn').addEventListener('click', async () => {
  await Promise.all(
    state.test.correctIds.map((id) =>
      api(`/api/words/${id}/basket`, { method: 'PATCH', body: JSON.stringify({ inTestBasket: false }) })
    )
  );
  $('test-remove-basket-btn').classList.add('hidden');
  await Promise.all([loadWords(), loadBasket()]);
});

$('test-retry-btn').addEventListener('click', openTestModal);

// --- Basket Events ---
$('basket-btn').addEventListener('click', async () => {
  await loadBasket();
  renderBasketModal();
  openModal('basket-modal');
});

$('basket-list').addEventListener('click', async (e) => {
  const speakBtn = e.target.closest('[data-speak]');
  if (speakBtn) {
    speakEnglish(speakBtn.dataset.speak);
    return;
  }
  const remBtn = e.target.closest('[data-remove-basket]');
  if (remBtn) {
    await api(`/api/words/${remBtn.dataset.removeBasket}/basket`, {
      method: 'PATCH',
      body: JSON.stringify({ inTestBasket: false }),
    });
    await Promise.all([loadBasket(), loadWords()]);
    renderBasketModal();
  }
});

$('clear-basket-btn').addEventListener('click', async () => {
  if (!confirm('Xóa toàn bộ từ khỏi Giỏ Test?')) return;
  await api('/api/words/basket', { method: 'DELETE' });
  await Promise.all([loadBasket(), loadWords()]);
  renderBasketModal();
});

$('start-basket-test-btn').addEventListener('click', openBasketTestModal);

// --- Admin Events ---
$('open-admin-btn').addEventListener('click', () => {
  closeDrawer();
  openAdminModal();
});

$('admin-create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('admin-error').classList.add('hidden');
  try {
    await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        username: $('admin-new-username').value.trim(),
        password: $('admin-new-password').value,
        role: $('admin-new-role').value,
        seedSample: $('admin-seed-sample').checked,
      }),
    });
    $('admin-new-username').value = '';
    $('admin-new-password').value = '';
    await loadAdminUsers();
  } catch (err) {
    $('admin-error').textContent = err.message;
    $('admin-error').classList.remove('hidden');
  }
});

$('admin-users-list').addEventListener('click', async (e) => {
  const chBtn = e.target.closest('[data-admin-chpass]');
  if (chBtn) {
    const newPass = prompt(`Nhập mật khẩu mới cho "${chBtn.dataset.adminUsername}" (tối thiểu 6 ký tự):`);
    if (!newPass) return;
    try {
      await api(`/api/admin/users/${chBtn.dataset.adminChpass}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPass }),
      });
      alert('Đã đổi mật khẩu thành công!');
    } catch (err) {
      alert(err.message);
    }
    return;
  }

  const delBtn = e.target.closest('[data-admin-del]');
  if (delBtn) {
    if (!confirm(`Xóa tài khoản "${delBtn.dataset.adminUsername}" và toàn bộ từ vựng của họ?`)) return;
    try {
      await api(`/api/admin/users/${delBtn.dataset.adminDel}`, { method: 'DELETE' });
      await loadAdminUsers();
    } catch (err) {
      alert(err.message);
    }
  }
});

$('export-csv-btn').addEventListener('click', exportCsv);

// --- Bulk Import ---
function openBulkModal() {
  if (state.topics.length === 0) {
    alert('Hãy tạo ít nhất 1 Topic trước khi nhập từ.');
    return;
  }
  $('bulk-topic-select').innerHTML = state.topics
    .map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`)
    .join('');
  if (state.activeTopicId) {
    $('bulk-topic-select').value = String(state.activeTopicId);
  }
  $('bulk-ai-error').classList.add('hidden');
  $('bulk-json-error').classList.add('hidden');
  openModal('bulk-modal');
}

$('bulk-import-btn').addEventListener('click', openBulkModal);

document.querySelectorAll('[data-bulk-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.bulkTab;
    document.querySelectorAll('[data-bulk-tab]').forEach((b) => {
      b.classList.toggle('active', b.dataset.bulkTab === tab);
    });
    $('bulk-ai-panel').classList.toggle('hidden', tab !== 'ai');
    $('bulk-json-panel').classList.toggle('hidden', tab !== 'json');
  });
});

$('bulk-ai-submit-btn').addEventListener('click', async () => {
  const errEl = $('bulk-ai-error');
  errEl.classList.add('hidden');
  const topicId = $('bulk-topic-select').value;
  const rawText = $('bulk-raw-input').value.trim();
  if (!rawText) {
    errEl.textContent = 'Vui lòng dán danh sách từ vựng.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = $('bulk-ai-submit-btn');
  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Đang phân tích...';

  try {
    const res = await api('/api/words/bulk-ai', {
      method: 'POST',
      body: JSON.stringify({ topicId, rawText }),
    });
    state.activeTopicId = topicId;
    $('bulk-raw-input').value = '';
    closeModal('bulk-modal');
    await loadTopics();
    alert(`Đã thêm thành công ${res.addedCount} từ bằng AI!`);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
});

$('bulk-json-submit-btn').addEventListener('click', async () => {
  const errEl = $('bulk-json-error');
  errEl.classList.add('hidden');
  const topicId = $('bulk-topic-select').value;

  let parsed;
  try {
    parsed = JSON.parse($('bulk-json-input').value.trim());
  } catch {
    errEl.textContent = 'JSON không hợp lệ. Hãy kiểm tra lại dấu ngoặc.';
    errEl.classList.remove('hidden');
    return;
  }

  const words = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.words) ? parsed.words : null;
  if (!words || words.length === 0) {
    errEl.textContent = 'JSON phải là một mảng [...] hoặc { "words": [...] }.';
    errEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await api('/api/words/bulk-json', {
      method: 'POST',
      body: JSON.stringify({ topicId, words }),
    });
    state.activeTopicId = topicId;
    $('bulk-json-input').value = '';
    closeModal('bulk-modal');
    await loadTopics();
    alert(`Đã nhập thành công ${res.addedCount} từ!`);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  }
});

$('copy-prompt-btn').addEventListener('click', async () => {
  const promptText = `Hãy chuyển danh sách từ vựng dưới đây thành JSON array. Mỗi phần tử gồm: word, pos (v/n/adj/adv/phrase), level (A1-C2), ipa, meaning (tiếng Việt), synonyms ([{word, level}] chỉ lấy từ band thấp A1-B1), collocations ([{phrase, tone: "neutral"|"negative"|"positive"}]), wordFamilies ([{word, pos, prep, tone}]), example (1 câu ngắn dùng từ A1-A2). Chỉ trả về JSON array thuần.\n\nDanh sách từ:\n`;
  await navigator.clipboard.writeText(promptText);
  const btn = $('copy-prompt-btn');
  btn.textContent = '✓ Đã copy!';
  setTimeout(() => (btn.textContent = '📋 Copy Prompt mẫu'), 1800);
});

window.addEventListener('resize', () => {
  renderWords();
});

checkSession();
