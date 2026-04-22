const mongoose = require('mongoose');
const User          = require('../models/user.model');
const FriendRequest = require('../models/friend-request.model');

// ─── Helper: lấy tập các userId liên quan đến current user ─────────────────────
const getRelatedIds = async (userId) => {
  const requests = await FriendRequest.find({
    $or: [{ from: userId }, { to: userId }],
    status: { $in: ['pending', 'accepted'] },
  }).select('from to status');

  const friendIds  = [];
  const pendingIds = [];

  for (const r of requests) {
    const other = r.from.toString() === userId.toString() ? r.to : r.from;
    if (r.status === 'accepted') friendIds.push(other);
    else pendingIds.push(other);
  }

  return { friendIds, pendingIds };
};

// ─── GET /api/social/suggestions ──────────────────────────────────────────────
// Gợi ý kết bạn dựa trên target + careerLevel
exports.getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const me = await User.findById(userId).select('target careerLevel');

    const { friendIds, pendingIds } = await getRelatedIds(userId);
    const excludeIds = [
      new mongoose.Types.ObjectId(userId),
      ...friendIds,
      ...pendingIds,
    ];

    const candidates = await User.find({
      _id:             { $nin: excludeIds },
      isEmailVerified: true,
    })
      .select('username email avatar target careerLevel')
      .limit(60);

    // Chấm điểm: cùng target +3, cùng level +2
    const scored = candidates
      .map((u) => ({
        user:  u,
        score: (me?.target      && u.target      === me.target      ? 3 : 0)
             + (me?.careerLevel && u.careerLevel === me.careerLevel ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((x) => x.user);

    res.json({ data: scored });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/social/search?q= ────────────────────────────────────────────────
// Tìm user theo email hoặc username
exports.searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Nhập ít nhất 2 ký tự để tìm kiếm' });
    }

    const userId = req.user._id;
    const regex  = new RegExp(q, 'i');

    const users = await User.find({
      _id:             { $ne: userId },
      isEmailVerified: true,
      $or: [{ email: regex }, { username: regex }],
    })
      .select('username email avatar target careerLevel')
      .limit(20);

    // Gán trạng thái quan hệ với current user
    const requests = await FriendRequest.find({
      $or: [
        { from: userId, to: { $in: users.map((u) => u._id) } },
        { from: { $in: users.map((u) => u._id) }, to: userId },
      ],
    });

    const result = users.map((u) => {
      const req1 = requests.find(
        (r) => r.from.toString() === userId.toString() && r.to.toString() === u._id.toString()
      );
      const req2 = requests.find(
        (r) => r.from.toString() === u._id.toString() && r.to.toString() === userId.toString()
      );

      let relation = 'none';
      let requestId = null;
      if (req1) { relation = req1.status === 'accepted' ? 'friend' : 'sent';     requestId = req1._id; }
      if (req2) { relation = req2.status === 'accepted' ? 'friend' : 'received'; requestId = req2._id; }

      return { ...u.toObject(), relation, requestId };
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/social/friend-requests ─────────────────────────────────────────
// Gửi lời mời kết bạn
exports.sendRequest = async (req, res, next) => {
  try {
    const fromId = req.user._id;
    const { toId } = req.body;

    if (!toId) return res.status(400).json({ message: 'toId is required' });
    if (toId.toString() === fromId.toString()) {
      return res.status(400).json({ message: 'Không thể tự gửi lời mời cho bản thân' });
    }

    const target = await User.findById(toId);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // Kiểm tra chiều ngược lại — nếu họ đã gửi cho mình thì tự động accept
    const reverse = await FriendRequest.findOne({ from: toId, to: fromId });
    if (reverse) {
      if (reverse.status === 'accepted') {
        return res.status(409).json({ message: 'Hai người đã là bạn bè' });
      }
      if (reverse.status === 'pending') {
        reverse.status = 'accepted';
        await reverse.save();
        return res.json({ data: reverse, message: 'Đã chấp nhận lời mời kết bạn' });
      }
    }

    const existing = await FriendRequest.findOne({ from: fromId, to: toId });
    if (existing) {
      if (existing.status === 'accepted') return res.status(409).json({ message: 'Hai người đã là bạn bè' });
      if (existing.status === 'pending')  return res.status(409).json({ message: 'Đã gửi lời mời, đang chờ phản hồi' });
      // rejected → cho gửi lại
      existing.status = 'pending';
      await existing.save();
      return res.json({ data: existing });
    }

    const request = await FriendRequest.create({ from: fromId, to: toId });
    res.status(201).json({ data: request });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/social/friend-requests ──────────────────────────────────────────
// Lấy danh sách lời mời đến (incoming)
exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      to:     req.user._id,
      status: 'pending',
    })
      .populate('from', 'username email avatar target careerLevel')
      .sort({ createdAt: -1 });

    res.json({ data: requests });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/social/friend-requests/:id/accept ─────────────────────────────
exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findOne({
      _id:    req.params.id,
      to:     req.user._id,
      status: 'pending',
    });

    if (!request) return res.status(404).json({ message: 'Lời mời không tồn tại' });

    request.status = 'accepted';
    await request.save();

    res.json({ data: request, message: 'Đã chấp nhận lời mời kết bạn' });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/social/friend-requests/:id/reject ─────────────────────────────
exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findOne({
      _id:    req.params.id,
      to:     req.user._id,
      status: 'pending',
    });

    if (!request) return res.status(404).json({ message: 'Lời mời không tồn tại' });

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Đã từ chối lời mời' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/social/friends/:userId ───────────────────────────────────────
// Huỷ kết bạn
exports.unfriend = async (req, res, next) => {
  try {
    const userId  = req.user._id;
    const otherId = req.params.userId;

    await FriendRequest.deleteOne({
      status: 'accepted',
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId },
      ],
    });

    res.json({ message: 'Đã huỷ kết bạn' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/social/friends ──────────────────────────────────────────────────
// Danh sách bạn bè
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      $or: [{ from: userId }, { to: userId }],
      status: 'accepted',
    })
      .populate('from', 'username email avatar target careerLevel')
      .populate('to',   'username email avatar target careerLevel')
      .sort({ updatedAt: -1 });

    const friends = requests.map((r) =>
      r.from._id.toString() === userId.toString() ? r.to : r.from
    );

    res.json({ data: friends });
  } catch (err) {
    next(err);
  }
};
