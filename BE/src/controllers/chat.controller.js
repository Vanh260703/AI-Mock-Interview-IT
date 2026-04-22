const Conversation = require('../models/conversation.model');
const Message      = require('../models/message.model');

const emit = (room, event, data) => {
  try {
    const { getIO } = require('../config/socket');
    getIO().to(room).emit(event, data);
  } catch {}
};

// ─── POST /api/chat/conversations ─────────────────────────────────────────────
// Tạo hoặc lấy conversation với toId
exports.getOrCreate = async (req, res, next) => {
  try {
    const me   = req.user._id;
    const { toId } = req.body;
    if (!toId) return res.status(400).json({ message: 'toId is required' });
    if (toId.toString() === me.toString()) {
      return res.status(400).json({ message: 'Không thể nhắn tin cho chính mình' });
    }

    let conv = await Conversation.findOne({
      participants: { $all: [me, toId], $size: 2 },
    }).populate('participants', 'username email avatar target careerLevel')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username email avatar' } });

    if (!conv) {
      conv = await Conversation.create({ participants: [me, toId] });
      await conv.populate('participants', 'username email avatar target careerLevel');
    }

    res.json({ data: conv });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/conversations ──────────────────────────────────────────────
// Danh sách conversation của tôi
exports.getConversations = async (req, res, next) => {
  try {
    const me = req.user._id;

    const convs = await Conversation.find({ participants: me })
      .populate('participants', 'username email avatar target careerLevel')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username email avatar' } })
      .sort({ updatedAt: -1 });

    // Đếm unread cho mỗi conversation
    const ids = convs.map((c) => c._id);
    const unreadAgg = await Message.aggregate([
      { $match: { conversation: { $in: ids }, sender: { $ne: me }, read: false } },
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
    ]);
    const unreadMap = {};
    unreadAgg.forEach(({ _id, count }) => { unreadMap[_id.toString()] = count; });

    const data = convs.map((c) => ({
      ...c.toObject(),
      unread: unreadMap[c._id.toString()] ?? 0,
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/conversations/:id/messages ─────────────────────────────────
// Lấy tin nhắn trong conversation (phân trang cursor-based)
exports.getMessages = async (req, res, next) => {
  try {
    const me    = req.user._id;
    const { id } = req.params;
    const { before, limit = 30 } = req.query;

    const conv = await Conversation.findOne({ _id: id, participants: me });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    const query = { conversation: id };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sender', 'username email avatar');

    res.json({ data: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/chat/conversations/:id/messages ────────────────────────────────
// Gửi tin nhắn
exports.sendMessage = async (req, res, next) => {
  try {
    const me    = req.user._id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

    const conv = await Conversation.findOne({ _id: id, participants: me });
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });

    const message = await Message.create({
      conversation: id,
      sender: me,
      content: content.trim(),
    });
    await message.populate('sender', 'username email avatar');

    // Cập nhật lastMessage và updatedAt để conversation nổi lên đầu danh sách
    conv.lastMessage = message._id;
    conv.updatedAt   = new Date();
    await conv.save();

    // Gửi realtime cho người kia
    const otherId = conv.participants.find((p) => p.toString() !== me.toString());
    if (otherId) {
      emit(`user_${otherId}`, 'chat:message', { conversationId: id, message });
    }

    res.status(201).json({ data: message });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/chat/conversations/:id/read ───────────────────────────────────
// Đánh dấu tất cả tin nhắn trong conversation là đã đọc
exports.markRead = async (req, res, next) => {
  try {
    const me    = req.user._id;
    const { id } = req.params;

    await Message.updateMany(
      { conversation: id, sender: { $ne: me }, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
};
