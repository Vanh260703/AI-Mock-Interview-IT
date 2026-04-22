import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../api/chat.api.js';
import { getSocket } from '../../lib/socket.js';
import { useAuthStore } from '../../store/auth.store.js';
import { TARGET_OPTIONS, CAREER_LEVEL_OPTIONS } from '../../lib/constants.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (d) => {
  const date = new Date(d);
  const diff  = Date.now() - date;
  if (diff < 60_000)    return 'vừa xong';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút`;
  if (diff < 86_400_000)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const Avatar = ({ user, size = 'w-10 h-10' }) => {
  const src = user?.avatar && !user.avatar.includes('vecteezy') ? user.avatar : null;
  const cls = `${size} rounded-full object-cover shrink-0`;
  return src ? (
    <img src={src} alt="avatar" className={cls} />
  ) : (
    <div className={`${cls} bg-violet-500 flex items-center justify-center text-white font-bold text-sm`}>
      {user?.email?.[0]?.toUpperCase() ?? 'U'}
    </div>
  );
};

const getOther = (conv, meId) =>
  conv.participants.find((p) => String(p._id) !== String(meId));

// ─── ConversationList ─────────────────────────────────────────────────────────
const ConversationList = ({ convs, activeId, onSelect, meId }) => {
  if (convs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 p-8">
        <MessageCircle size={40} strokeWidth={1.5} />
        <p className="text-sm text-center">Chưa có cuộc trò chuyện nào.<br />Nhắn tin với bạn bè từ trang Cộng đồng!</p>
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
      {convs.map((conv) => {
        const other   = getOther(conv, meId);
        const target  = TARGET_OPTIONS.find((t) => t.value === other?.target);
        const lastMsg = conv.lastMessage;
        const unread  = conv.unread ?? 0;
        const isActive = conv._id === activeId;

        const lastText = lastMsg
          ? (String(lastMsg.sender?._id ?? lastMsg.sender) === String(meId)
              ? `Bạn: ${lastMsg.content}`
              : lastMsg.content)
          : 'Chưa có tin nhắn';

        return (
          <li
            key={conv._id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${
              isActive ? 'bg-violet-50 border-l-[3px] border-violet-500' : ''
            }`}
          >
            <div className="relative shrink-0">
              <Avatar user={other} size="w-11 h-11" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-violet-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                  {other?.username ?? other?.email}
                </p>
                {lastMsg && (
                  <span className="text-[11px] text-gray-400 shrink-0">{fmtTime(lastMsg.createdAt)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {target && <span className="text-[11px] text-indigo-400 shrink-0">{target.emoji}</span>}
                <p className={`text-xs truncate ${unread > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {lastText}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ─── ChatWindow ───────────────────────────────────────────────────────────────
const ChatWindow = ({ conv, meId, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  const other = getOther(conv, meId);

  // Load messages
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    chatApi.getMessages(conv._id)
      .then((res) => setMessages(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    chatApi.markRead(conv._id).catch(() => {});
  }, [conv._id]);

  // Lắng nghe tin nhắn mới realtime trong conversation này
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      if (conversationId !== conv._id) return;
      setMessages((prev) => [...prev, message]);
      chatApi.markRead(conv._id).catch(() => {});
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [conv._id]);

  // Scroll xuống khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resetTextarea = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    resetTextarea();
    try {
      const res    = await chatApi.sendMessage(conv._id, content);
      const newMsg = res.data.data;
      setMessages((prev) => [...prev, newMsg]);
      onMessageSent(conv._id, newMsg);
    } catch {
      toast.error('Gửi tin nhắn thất bại');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const targetInfo = TARGET_OPTIONS.find((t) => t.value === other?.target);
  const levelLabel = CAREER_LEVEL_OPTIONS.find((l) => l.value === other?.careerLevel)?.label;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <Avatar user={other} size="w-9 h-9" />
        <div>
          <p className="font-semibold text-gray-800 text-sm">{other?.username ?? other?.email}</p>
          {(targetInfo || levelLabel) && (
            <p className="text-xs text-gray-400">
              {targetInfo ? `${targetInfo.emoji} ${targetInfo.label}` : ''}
              {targetInfo && levelLabel ? ' · ' : ''}
              {levelLabel ?? ''}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 size={24} className="text-violet-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <MessageCircle size={36} strokeWidth={1.5} />
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = String(msg.sender?._id ?? msg.sender) === String(meId);
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                {!isMine && <Avatar user={other} size="w-7 h-7" />}
                <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                  isMine
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                  <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-violet-200' : 'text-gray-400'}`}>
                    {fmtTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-300 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none overflow-y-auto py-1"
            style={{ maxHeight: '128px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MessagesPage ─────────────────────────────────────────────────────────────
const MessagesPage = () => {
  const { user: me } = useAuthStore();
  const meId         = me?._id ?? me?.id;   // fallback: login trả về id, getMe trả về _id
  const location     = useLocation();
  const [convs, setConvs]         = useState([]);
  const [active, setActive]       = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const loadConvs = useCallback(() => {
    chatApi.getConversations()
      .then((res) => setConvs(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => { loadConvs(); }, [loadConvs]);

  // Nếu navigate với state.toId → mở/tạo conversation ngay
  useEffect(() => {
    const toId = location.state?.toId;
    if (!toId) return;
    chatApi.getOrCreate(toId)
      .then((res) => {
        const conv = res.data.data;
        setConvs((prev) => {
          const exists = prev.find((c) => c._id === conv._id);
          if (exists) return prev;
          return [{ ...conv, unread: 0 }, ...prev];
        });
        setActive(conv);
      })
      .catch(() => {});
  }, [location.state?.toId]);

  // Socket: cập nhật danh sách khi nhận tin nhắn mới
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      setConvs((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId);
        if (idx === -1) { loadConvs(); return prev; }
        const updated = {
          ...prev[idx],
          lastMessage: message,
          unread: active?._id === conversationId
            ? (prev[idx].unread ?? 0)
            : (prev[idx].unread ?? 0) + 1,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    };
    socket.on('chat:message', handler);
    return () => socket.off('chat:message', handler);
  }, [active?._id, loadConvs]);

  const handleSelect = (conv) => {
    setActive(conv);
    setConvs((prev) => prev.map((c) => c._id === conv._id ? { ...c, unread: 0 } : c));
  };

  const handleMessageSent = (convId, newMsg) => {
    setConvs((prev) => {
      const idx = prev.findIndex((c) => c._id === convId);
      if (idx === -1) return prev;
      const updated = { ...prev[idx], lastMessage: newMsg };
      return [updated, ...prev.filter((_, i) => i !== idx)];
    });
  };

  return (
    <div className="flex h-full">
      {/* Left panel — danh sách conversation */}
      <aside className="w-80 border-r border-gray-100 flex flex-col bg-white shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Tin nhắn</h2>
        </div>

        {loadingConvs ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="text-violet-500 animate-spin" />
          </div>
        ) : (
          <ConversationList
            convs={convs}
            activeId={active?._id}
            onSelect={handleSelect}
            meId={meId}
          />
        )}
      </aside>

      {/* Right panel — khung chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {active ? (
          <ChatWindow
            key={active._id}
            conv={active}
            meId={meId}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageCircle size={56} strokeWidth={1} />
            <p className="text-base">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
