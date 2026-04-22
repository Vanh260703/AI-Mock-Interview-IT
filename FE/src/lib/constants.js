export const TARGET_OPTIONS = [
  { value: 'FE',       label: 'Frontend',   emoji: '🎨' },
  { value: 'BE',       label: 'Backend',    emoji: '⚙️' },
  { value: 'FS',       label: 'Fullstack',  emoji: '🔄' },
  { value: 'DevOps',   label: 'DevOps',     emoji: '🚀' },
  { value: 'Mobile',   label: 'Mobile',     emoji: '📱' },
  { value: 'Data',     label: 'Data / AI',  emoji: '📊' },
  { value: 'Security', label: 'Security',   emoji: '🔐' },
  { value: 'other',    label: 'Khác',       emoji: '💼' },
];

export const CAREER_LEVEL_OPTIONS = [
  { value: 'intern',  label: 'Intern'  },
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior',  label: 'Junior'  },
  { value: 'middle',  label: 'Middle'  },
  { value: 'senior',  label: 'Senior'  },
];

export const LEVEL_MAP = {
  intern:  { label: 'Intern',  difficulty: 'Easy',   color: 'bg-green-100 text-green-700' },
  fresher: { label: 'Fresher', difficulty: 'Easy',   color: 'bg-green-100 text-green-700' },
  junior:  { label: 'Junior',  difficulty: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  middle:  { label: 'Middle',  difficulty: 'Hard',   color: 'bg-orange-100 text-orange-700' },
  senior:  { label: 'Senior',  difficulty: 'Hard',   color: 'bg-red-100 text-red-700' },
};

export const STATUS_MAP = {
  in_progress: { label: 'Đang làm',   color: 'bg-blue-100 text-blue-700' },
  completed:   { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  abandoned:   { label: 'Bỏ dở',      color: 'bg-gray-100 text-gray-600' },
  pending:     { label: 'Chờ',        color: 'bg-yellow-100 text-yellow-700' },
};

export const ROLE_LABELS = {
  FE: 'Frontend', BE: 'Backend', FS: 'Fullstack',
  BA: 'Business Analyst', DA: 'Data Analyst', DS: 'Data Science',
  DevOps: 'DevOps', Mobile: 'Mobile', General: 'General',
};

export const CATEGORY_LABELS = {
  technical:   'Kỹ thuật',
  behavioral:  'Hành vi',
  situational: 'Tình huống',
  hr:          'HR',
};

export const scoreColor = (score) => {
  if (score == null) return 'text-gray-400';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-500';
};

export const scoreBg = (score) => {
  if (score == null) return 'bg-gray-100 text-gray-500';
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0 phút';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}g ${m}p`;
  if (m > 0) return `${m} phút ${s > 0 ? `${s}s` : ''}`.trim();
  return `${s} giây`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};
