import { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';

// ─── Content Parser ───────────────────────────────────────────────────────────
// Tách markdown content thành: description, examples[], constraints[]
function parseContent(raw) {
  if (!raw) return { description: '', examples: [], constraints: [] };

  const lines = raw.split('\n');
  const descLines = [];
  const examples = [];
  const constraints = [];

  let inCodeBlock = false;
  let codeLang = '';
  let codeLines = [];
  let inConstraints = false;
  let pastExamples = false;

  for (const line of lines) {
    // Phát hiện mở/đóng code fence
    const fenceMatch = line.match(/^```(\w*)$/);

    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = fenceMatch[1];
        codeLines = [];
      } else {
        // Kết thúc code block — phân loại
        const blockText = codeLines.join('\n');
        const firstNonEmpty = codeLines.find((l) => l.trim())?.trim() ?? '';

        const isExampleBlock =
          firstNonEmpty.startsWith('Ví dụ') ||
          (blockText.includes('Input:') &&
            (blockText.includes('Output:') || blockText.includes('// ')));

        if (isExampleBlock) {
          pastExamples = true;
          const inputLines = [];
          const outputLines = [];
          const explanLines = [];
          let section = 'header';

          for (const cl of codeLines) {
            const t = cl.trim();
            if (!t || t.startsWith('Ví dụ')) { section = 'header'; continue; }

            if (t.startsWith('Input:')) {
              section = 'input';
              const val = t.replace(/^Input:\s*/, '').trim();
              if (val) inputLines.push(val);
            } else if (t.startsWith('Output:')) {
              section = 'output';
              const val = t.replace(/^Output:\s*/, '').trim();
              if (val) outputLines.push(val);
            } else if (t.startsWith('//')) {
              explanLines.push(t.replace(/^\/\/\s*/, ''));
            } else if (section === 'input' && t) {
              inputLines.push(cl.replace(/^\s{2}/, '').trimEnd());
            } else if (section === 'output' && t) {
              outputLines.push(cl.replace(/^\s{2}/, '').trimEnd());
            }
          }

          examples.push({
            input: inputLines.join('\n'),
            output: outputLines.join('\n'),
            explanation: explanLines.join(' '),
          });
        } else if (!pastExamples) {
          // Block không phải example (e.g. định nghĩa Node/Class) → giữ trong description
          descLines.push('```' + codeLang);
          descLines.push(...codeLines);
          descLines.push('```');
        }

        inCodeBlock = false;
        codeLang = '';
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) { codeLines.push(line); continue; }

    // Phát hiện section Ràng buộc
    if (/^\*\*Ràng buộc:\*\*/.test(line)) { inConstraints = true; continue; }

    if (inConstraints) {
      if (line.startsWith('- ')) constraints.push(line.slice(2));
      continue;
    }

    if (!pastExamples) descLines.push(line);
  }

  return {
    description: descLines.join('\n').trim(),
    examples,
    constraints,
  };
}

// Trích xuất title từ content nếu có pattern "**Name:**"
function extractTitle(content, topic) {
  if (content) {
    const m = content.match(/^\*\*([^:*\n]+(?:\s*\([^)]*\))?)\s*:\*\*/);
    if (m) return m[1].trim();
  }
  return topic ?? 'Coding Challenge';
}

// ─── Description Block ────────────────────────────────────────────────────────
// Render toàn bộ description thành 1 thẻ <p> duy nhất — text chảy liền mạch.
// Code blocks riêng (e.g. node definition) render nhỏ gọn bên dưới.
function DescriptionBlock({ text }) {
  if (!text) return null;

  // Tách code fences ra khỏi prose text
  const codeBlocks = [];
  const proseText = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
      codeBlocks.push(code.trim());
      return ''; // xoá khỏi prose
    })
    // Collapse multiple newlines/spaces thành 1 khoảng trắng
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return (
    <div>
      <p className="text-gray-300 text-sm leading-relaxed">
        <InlineMd text={proseText} />
      </p>
      {codeBlocks.map((cb, i) => (
        <pre
          key={i}
          className="bg-gray-800/50 text-gray-400 text-xs font-mono px-3 py-2 rounded-md mt-2 overflow-x-auto border border-gray-700/40 leading-relaxed"
        >
          {cb}
        </pre>
      ))}
    </div>
  );
}

// ─── Inline Markdown (safe, no dangerouslySetInnerHTML) ───────────────────────
function InlineMd({ text }) {
  if (!text) return null;
  const parts = [];
  let rem = text;
  let k = 0;

  while (rem.length) {
    const bm = rem.match(/\*\*([^*]+)\*\*/);
    const cm = rem.match(/`([^`]+)`/);

    let pick = null;
    if (bm && cm) pick = bm.index <= cm.index ? bm : cm;
    else pick = bm ?? cm;

    if (!pick) { parts.push(<span key={k++}>{rem}</span>); break; }

    if (pick.index > 0) parts.push(<span key={k++}>{rem.slice(0, pick.index)}</span>);

    if (pick === bm) {
      parts.push(<strong key={k++} className="text-white font-semibold">{bm[1]}</strong>);
    } else {
      parts.push(
        <code key={k++} className="bg-[rgba(110,118,129,0.12)] text-gray-200 px-[5px] py-[2px] rounded font-mono text-[0.875em] border border-[rgba(110,118,129,0.2)]">
          {cm[1]}
        </code>
      );
    }

    rem = rem.slice(pick.index + pick[0].length);
  }

  return <>{parts}</>;
}

// ─── Difficulty config ────────────────────────────────────────────────────────
const DIFF = {
  easy:   { label: 'Easy',   cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25' },
  medium: { label: 'Medium', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
  hard:   { label: 'Hard',   cls: 'text-red-400 bg-red-400/10 border-red-400/25' },
};

// ─── Example Box ─────────────────────────────────────────────────────────────
const ExampleBox = ({ number, input, output, explanation }) => (
  <div className="rounded-lg overflow-hidden border border-gray-700/60 bg-gray-900/40">
    <div className="px-4 py-2 bg-[#1a1a2e] border-b border-gray-700/60 flex items-center gap-2">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        Example {number}
      </span>
    </div>
    <div className="px-4 py-4 space-y-2.5">
      {input && (
        <div className="font-mono text-sm">
          <span className="text-gray-500 text-xs font-semibold mr-3 select-none">Input</span>
          <pre className="inline text-gray-200 whitespace-pre-wrap break-all">{input}</pre>
        </div>
      )}
      {output && (
        <div className="font-mono text-sm">
          <span className="text-gray-500 text-xs font-semibold mr-3 select-none">Output</span>
          <pre className="inline text-gray-200 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
      {explanation && (
        <div className="text-xs text-gray-500 italic border-t border-gray-700/40 pt-2.5 mt-2">
          <span className="not-italic text-gray-600 mr-1">Explanation:</span>
          {explanation}
        </div>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LeetCodeQuestionPanel = ({ question }) => {
  const [hintsOpen, setHintsOpen] = useState(false);

  if (!question) return null;

  const { content, difficulty, topic, tags, hints } = question;
  const parsed = parseContent(content);
  const title  = question.title ?? extractTitle(content, topic ?? 'Coding Challenge');
  const diff   = DIFF[difficulty] ?? DIFF.medium;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto text-sm"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
    >
      {/* ── Header: Title + badges ── */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-700/50 flex-shrink-0">
        <h1 className="text-[18px] font-bold text-white mb-3 leading-snug">{title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Difficulty */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${diff.cls}`}>
            {diff.label}
          </span>

          {/* Topic */}
          {topic && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-sky-400 bg-sky-400/10 border border-sky-400/25">
              {topic}
            </span>
          )}

          {/* Tags (tối đa 3, bỏ tag "coding") */}
          {tags
            ?.filter((t) => t !== 'coding')
            .slice(0, 3)
            .map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs text-gray-400 bg-gray-700/40 border border-gray-600/30">
                {tag}
              </span>
            ))}
        </div>
      </div>

      {/* ── Description ── */}
      {parsed.description && (
        <div className="px-6 py-5 border-b border-gray-700/30">
          <DescriptionBlock text={parsed.description} />
        </div>
      )}

      {/* ── Examples ── */}
      {parsed.examples.length > 0 && (
        <div className="px-6 py-5 border-b border-gray-700/30 space-y-3">
          {parsed.examples.map((ex, i) => (
            <ExampleBox key={i} number={i + 1} {...ex} />
          ))}
        </div>
      )}

      {/* ── Constraints ── */}
      {parsed.constraints.length > 0 && (
        <div className="px-6 py-5 border-b border-gray-700/30">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Constraints
          </h3>
          <ul className="space-y-2">
            {parsed.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-gray-300 leading-relaxed">
                <span className="text-gray-600 font-bold mt-0.5 flex-shrink-0 select-none">·</span>
                <span><InlineMd text={c} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Hints (collapsible) ── */}
      {hints && hints.length > 0 && (
        <div className="px-6 py-5">
          <button
            type="button"
            onClick={() => setHintsOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
          >
            <Lightbulb size={14} className="group-hover:scale-110 transition-transform" />
            <span>Hint{hints.length > 1 ? 's' : ''}</span>
            <span className="text-xs font-normal text-amber-500/70">({hints.length})</span>
            {hintsOpen
              ? <ChevronDown size={13} className="ml-0.5" />
              : <ChevronRight size={13} className="ml-0.5" />}
          </button>

          {hintsOpen && (
            <div className="mt-3 space-y-2">
              {hints.map((hint, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3"
                >
                  <span className="text-amber-500 font-bold text-xs flex-shrink-0 mt-0.5">
                    #{i + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed">{hint}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom padding */}
      <div className="flex-1 min-h-6" />
    </div>
  );
};

export default LeetCodeQuestionPanel;
