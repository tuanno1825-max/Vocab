require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vocab_notebook';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ALLOW_SELF_REGISTER = process.env.ALLOW_SELF_REGISTER !== 'false';

// --- Mongoose Models ---
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    usernameLower: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

const topicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const wordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    word: { type: String, required: true, trim: true },
    pos: { type: String, default: 'v', trim: true },
    level: { type: String, default: 'B2', trim: true },
    ipa: { type: String, default: '', trim: true },
    meaning: { type: String, required: true, trim: true },
    synonyms: [
      {
        _id: false,
        word: { type: String, trim: true },
        level: { type: String, trim: true, default: '' },
      },
    ],
    collocations: [
      {
        _id: false,
        phrase: { type: String, trim: true },
        tone: { type: String, enum: ['neutral', 'negative', 'positive'], default: 'neutral' },
      },
    ],
    wordFamilies: [
      {
        _id: false,
        word: { type: String, trim: true },
        pos: { type: String, trim: true, default: 'n' },
        prep: { type: String, trim: true, default: '' },
        tone: { type: String, enum: ['neutral', 'negative', 'positive'], default: 'neutral' },
      },
    ],
    example: { type: String, default: '', trim: true },
    mastered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Topic = mongoose.model('Topic', topicSchema);
const Word = mongoose.model('Word', wordSchema);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function serializeWord(doc) {
  return {
    id: String(doc._id),
    topicId: String(doc.topicId),
    word: doc.word,
    pos: doc.pos,
    level: doc.level,
    ipa: doc.ipa,
    meaning: doc.meaning,
    synonyms: doc.synonyms || [],
    collocations: doc.collocations || [],
    wordFamilies: doc.wordFamilies || [],
    example: doc.example || '',
    mastered: Boolean(doc.mastered),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function setAuthCookie(res, user) {
  const token = jwt.sign({ userId: String(user._id), role: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  });
  res.cookie('vocab_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

async function requireAuth(req, res, next) {
  const token = req.cookies?.vocab_token;
  if (!token) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('_id username role').lean();
    if (!user) {
      return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' });
    }
    req.user = { id: String(user._id), username: user.username, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền quản trị viên.' });
  }
  next();
}

async function seedStarterDataForUser(userId) {
  const topic = await Topic.create({
    userId,
    name: 'Topic mẫu: Daily & Academic',
    description: 'Từ vựng mẫu theo cấu trúc chuẩn (Collocation + Họ từ)',
  });

  await Word.create({
    userId,
    topicId: topic._id,
    word: 'rely',
    pos: 'v',
    level: 'B2',
    ipa: '/rɪˈlaɪ/',
    meaning: 'phụ thuộc, tin cậy',
    synonyms: [{ word: 'depend', level: 'B1' }],
    collocations: [
      { phrase: 'rely on sth/sb', tone: 'neutral' },
      { phrase: 'overrely on sth/sb', tone: 'negative' },
    ],
    wordFamilies: [
      { word: 'reliance', pos: 'n', prep: 'on', tone: 'neutral' },
      { word: 'be reliant', pos: 'adj', prep: 'on', tone: 'neutral' },
      { word: 'overreliance', pos: 'n', prep: 'on', tone: 'negative' },
      { word: 'be overreliant', pos: 'adj', prep: 'on', tone: 'negative' },
    ],
    example: 'Many young people overrely on their smartphones for daily information.',
    mastered: false,
  });
}

function validateCredentials(username, password) {
  if (username.length < 3 || username.length > 32) {
    return 'Tên đăng nhập phải từ 3 đến 32 ký tự.';
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return 'Tên đăng nhập chỉ chứa chữ, số, dấu gạch dưới hoặc dấu chấm.';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự.';
  }
  return null;
}

// --- Auth Routes ---
app.get('/api/auth/config', (req, res) => {
  res.json({ allowSelfRegister: ALLOW_SELF_REGISTER });
});

app.post('/api/auth/register', async (req, res) => {
  if (!ALLOW_SELF_REGISTER) {
    return res.status(403).json({ error: 'Đăng ký tự do đã tắt. Vui lòng liên hệ quản trị viên.' });
  }

  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const errMsg = validateCredentials(username, password);
  if (errMsg) return res.status(400).json({ error: errMsg });

  const usernameLower = username.toLowerCase();
  const existing = await User.findOne({ usernameLower }).lean();
  if (existing) {
    return res.status(409).json({ error: 'Tên đăng nhập này đã tồn tại.' });
  }

  const totalUsers = await User.countDocuments();
  const role = totalUsers === 0 ? 'admin' : 'user';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, usernameLower, passwordHash, role });
  await seedStarterDataForUser(user._id);
  setAuthCookie(res, user);

  res.status(201).json({
    user: { id: String(user._id), username: user.username, role: user.role },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const user = await User.findOne({ usernameLower: username.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
  }

  setAuthCookie(res, user);
  res.json({
    user: { id: String(user._id), username: user.username, role: user.role },
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('vocab_token');
  res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies?.vocab_token;
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('_id username role').lean();
    if (!user) return res.json({ user: null });
    return res.json({ user: { id: String(user._id), username: user.username, role: user.role } });
  } catch {
    return res.json({ user: null });
  }
});

// --- Admin Routes ---
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find().select('_id username role createdAt').sort({ createdAt: 1 }).lean();
  const [topicCounts, wordCounts] = await Promise.all([
    Topic.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
    Word.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
  ]);

  const topicMap = new Map(topicCounts.map((t) => [String(t._id), t.count]));
  const wordMap = new Map(wordCounts.map((w) => [String(w._id), w.count]));

  res.json({
    users: users.map((u) => ({
      id: String(u._id),
      username: u.username,
      role: u.role,
      topicCount: topicMap.get(String(u._id)) || 0,
      wordCount: wordMap.get(String(u._id)) || 0,
      createdAt: u.createdAt,
    })),
  });
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  const role = req.body?.role === 'admin' ? 'admin' : 'user';
  const seedSample = req.body?.seedSample !== false;

  const errMsg = validateCredentials(username, password);
  if (errMsg) return res.status(400).json({ error: errMsg });

  const usernameLower = username.toLowerCase();
  const existing = await User.findOne({ usernameLower }).lean();
  if (existing) {
    return res.status(409).json({ error: 'Tên đăng nhập này đã tồn tại.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, usernameLower, passwordHash, role });
  if (seedSample) {
    await seedStarterDataForUser(user._id);
  }

  res.status(201).json({
    user: {
      id: String(user._id),
      username: user.username,
      role: user.role,
      topicCount: seedSample ? 1 : 0,
      wordCount: seedSample ? 1 : 0,
    },
  });
});

app.put('/api/admin/users/:id/password', requireAuth, requireAdmin, async (req, res) => {
  const password = String(req.body?.password || '');
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await User.findByIdAndUpdate(req.params.id, { passwordHash });
  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
  }
  res.json({ ok: true });
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Không thể tự xóa tài khoản quản trị đang đăng nhập.' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
  }

  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
  }

  await Promise.all([
    Topic.deleteMany({ userId: deleted._id }),
    Word.deleteMany({ userId: deleted._id }),
  ]);

  res.json({ ok: true });
});

// --- Topics Routes ---
app.get('/api/topics', requireAuth, async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.id);
  const [topics, wordStats] = await Promise.all([
    Topic.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean(),
    Word.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$topicId',
          wordCount: { $sum: 1 },
          masteredCount: { $sum: { $cond: ['$mastered', 1, 0] } },
        },
      },
    ]),
  ]);

  const statMap = new Map(wordStats.map((s) => [String(s._id), s]));

  res.json({
    topics: topics.map((t) => {
      const stat = statMap.get(String(t._id));
      return {
        id: String(t._id),
        name: t.name,
        description: t.description || '',
        wordCount: stat?.wordCount || 0,
        masteredCount: stat?.masteredCount || 0,
        createdAt: t.createdAt,
      };
    }),
  });
});

app.post('/api/topics', requireAuth, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const description = String(req.body?.description || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Tên topic không được để trống.' });
  }

  const topic = await Topic.create({ userId: req.user.id, name, description });
  res.status(201).json({
    topic: {
      id: String(topic._id),
      name: topic.name,
      description: topic.description,
      wordCount: 0,
      masteredCount: 0,
    },
  });
});

app.put('/api/topics/:id', requireAuth, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const description = String(req.body?.description || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Tên topic không được để trống.' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy topic.' });
  }

  const updated = await Topic.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { name, description }
  );
  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy topic.' });
  }
  res.json({ ok: true });
});

app.delete('/api/topics/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy topic.' });
  }
  const deleted = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy topic.' });
  }
  await Word.deleteMany({ topicId: deleted._id, userId: req.user.id });
  res.json({ ok: true });
});

// --- Words Routes ---
function sanitizeWordPayload(body) {
  const word = String(body?.word || '').trim();
  const pos = String(body?.pos || 'v').trim();
  const level = String(body?.level || 'B2').trim();
  const ipa = String(body?.ipa || '').trim();
  const meaning = String(body?.meaning || '').trim();
  const example = String(body?.example || '').trim();
  const topicId = String(body?.topicId || '').trim();
  const mastered = typeof body?.mastered === 'boolean' ? body.mastered : undefined;

  const synonyms = Array.isArray(body?.synonyms)
    ? body.synonyms
        .map((s) => ({
          word: String(s?.word || '').trim(),
          level: String(s?.level || '').trim(),
        }))
        .filter((s) => s.word)
    : [];

  const collocations = Array.isArray(body?.collocations)
    ? body.collocations
        .map((c) => ({
          phrase: String(c?.phrase || '').trim(),
          tone: ['neutral', 'negative', 'positive'].includes(c?.tone) ? c.tone : 'neutral',
        }))
        .filter((c) => c.phrase)
    : [];

  const wordFamilies = Array.isArray(body?.wordFamilies)
    ? body.wordFamilies
        .map((f) => ({
          word: String(f?.word || '').trim(),
          pos: String(f?.pos || 'n').trim(),
          prep: String(f?.prep || '').trim(),
          tone: ['neutral', 'negative', 'positive'].includes(f?.tone) ? f.tone : 'neutral',
        }))
        .filter((f) => f.word)
    : [];

  return { word, pos, level, ipa, meaning, example, topicId, mastered, synonyms, collocations, wordFamilies };
}

app.get('/api/words', requireAuth, async (req, res) => {
  const filter = { userId: req.user.id };
  if (req.query.topicId) {
    if (!mongoose.isValidObjectId(req.query.topicId)) {
      return res.json({ words: [] });
    }
    filter.topicId = req.query.topicId;
  }

  const docs = await Word.find(filter).sort({ createdAt: -1 }).lean();
  let words = docs.map(serializeWord);

  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) {
    words = words.filter((w) => {
      const hay = [
        w.word,
        w.meaning,
        w.example,
        ...w.synonyms.map((s) => s.word),
        ...w.collocations.map((c) => c.phrase),
        ...w.wordFamilies.map((f) => f.word),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  res.json({ words });
});

app.post('/api/words', requireAuth, async (req, res) => {
  const data = sanitizeWordPayload(req.body);
  if (!data.word || !data.meaning || !mongoose.isValidObjectId(data.topicId)) {
    return res.status(400).json({ error: 'Vui lòng nhập Topic, Từ mới và Nghĩa.' });
  }

  const topic = await Topic.findOne({ _id: data.topicId, userId: req.user.id }).lean();
  if (!topic) {
    return res.status(404).json({ error: 'Topic không tồn tại.' });
  }

  const created = await Word.create({
    userId: req.user.id,
    topicId: data.topicId,
    word: data.word,
    pos: data.pos,
    level: data.level,
    ipa: data.ipa,
    meaning: data.meaning,
    synonyms: data.synonyms,
    collocations: data.collocations,
    wordFamilies: data.wordFamilies,
    example: data.example,
    mastered: Boolean(data.mastered),
  });

  res.status(201).json({ word: serializeWord(created) });
});

app.put('/api/words/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }
  const data = sanitizeWordPayload(req.body);
  if (!data.word || !data.meaning || !mongoose.isValidObjectId(data.topicId)) {
    return res.status(400).json({ error: 'Vui lòng nhập Topic, Từ mới và Nghĩa.' });
  }

  const topic = await Topic.findOne({ _id: data.topicId, userId: req.user.id }).lean();
  if (!topic) {
    return res.status(404).json({ error: 'Topic không tồn tại.' });
  }

  const updateFields = {
    topicId: data.topicId,
    word: data.word,
    pos: data.pos,
    level: data.level,
    ipa: data.ipa,
    meaning: data.meaning,
    synonyms: data.synonyms,
    collocations: data.collocations,
    wordFamilies: data.wordFamilies,
    example: data.example,
  };
  if (typeof data.mastered === 'boolean') {
    updateFields.mastered = data.mastered;
  }

  const updated = await Word.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    updateFields,
    { new: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }

  res.json({ word: serializeWord(updated) });
});

app.patch('/api/words/:id/mastered', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }
  const mastered = Boolean(req.body?.mastered);
  const updated = await Word.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { mastered },
    { new: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }
  res.json({ word: serializeWord(updated) });
});

app.delete('/api/words/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }
  const deleted = await Word.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) {
    return res.status(404).json({ error: 'Không tìm thấy từ vựng.' });
  }
  res.json({ ok: true });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Vocab Notebook server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
