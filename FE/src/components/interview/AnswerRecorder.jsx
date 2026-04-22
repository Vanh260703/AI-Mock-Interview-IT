import { useState, useRef } from 'react';
import { Mic, MicOff, Type, Square, Play } from 'lucide-react';

const AnswerRecorder = ({ value, onChange, onMediaReady }) => {
  const [tab, setTab] = useState('text'); // 'text' | 'audio'
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onMediaReady?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setIsRecording(false);
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    onMediaReady?.(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'text' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Type size={14} /> Gõ câu trả lời
        </button>
        <button
          type="button"
          onClick={() => setTab('audio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'audio' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mic size={14} /> Ghi âm
        </button>
      </div>

      {/* Content */}
      {tab === 'text' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập câu trả lời của bạn tại đây..."
          className="flex-1 w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition"
          rows={8}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 p-8">
          {!audioUrl ? (
            <>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-violet-100'
              }`}>
                {isRecording ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-violet-600" />}
              </div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2"><Square size={14} /> Dừng ghi âm</span>
                ) : (
                  <span className="flex items-center gap-2"><Mic size={14} /> Bắt đầu ghi âm</span>
                )}
              </button>
              {isRecording && <p className="text-sm text-red-500 animate-pulse">Đang ghi âm...</p>}
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Play size={16} /> Ghi âm hoàn tất — AI sẽ tự phiên âm
              </div>
              <audio src={audioUrl} controls className="w-full max-w-xs" />
              <button
                type="button"
                onClick={clearAudio}
                className="text-xs text-gray-400 hover:text-red-500 underline"
              >
                Xóa và ghi lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerRecorder;
