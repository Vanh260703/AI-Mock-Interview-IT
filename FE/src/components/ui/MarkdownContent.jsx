import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * MarkdownContent — render markdown với code block theo style IDE dark.
 * theme: 'dark' (dùng trong dark panel) | 'light' (default)
 */
const MarkdownContent = ({ children, theme = 'light', compact = false }) => {
  const isDark = theme === 'dark';

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // ── Code block (```) ─────────────────────────────────────────────────
        code({ node, inline, className, children, ...props }) {
          const lang = /language-(\w+)/.exec(className || '')?.[1] ?? '';
          const code = String(children).replace(/\n$/, '');

          if (inline) {
            return (
              <code
                className={`px-[5px] py-[2px] rounded text-[0.875em] font-mono ${
                  isDark
                    ? 'bg-[rgba(110,118,129,0.12)] text-gray-200 border border-[rgba(110,118,129,0.2)]'
                    : 'bg-gray-100 text-violet-700'
                }`}
                {...props}
              >
                {code}
              </code>
            );
          }

          // compact mode — dùng trong description panel (không cần Mac toolbar)
          if (compact) {
            return (
              <pre className="bg-gray-800/50 text-gray-300 text-[13px] font-mono px-3 py-2 rounded-md my-2 overflow-x-auto leading-relaxed border border-gray-700/40">
                <code>{code}</code>
              </pre>
            );
          }

          return (
            <div className="rounded-lg overflow-hidden border border-gray-700 my-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] border-b border-gray-700">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                {lang && <span className="ml-2 text-xs text-gray-400 font-mono">{lang}</span>}
              </div>
              <pre className="bg-[#1e1e1e] text-gray-200 text-sm font-mono px-4 py-3 overflow-x-auto leading-relaxed m-0">
                <code>{code}</code>
              </pre>
            </div>
          );
        },

        // ── Headings ─────────────────────────────────────────────────────────
        h1({ children }) {
          return <h1 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{children}</h1>;
        },
        h2({ children }) {
          return <h2 className={`text-lg font-semibold mb-2 mt-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{children}</h2>;
        },
        h3({ children }) {
          return <h3 className={`text-base font-semibold mb-1.5 mt-3 ${isDark ? 'text-gray-100' : 'text-gray-700'}`}>{children}</h3>;
        },

        // ── Paragraph ────────────────────────────────────────────────────────
        p({ children }) {
          return (
            <p className={`mb-3 leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {children}
            </p>
          );
        },

        // ── Strong / Em ──────────────────────────────────────────────────────
        strong({ children }) {
          return (
            <strong className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {children}
            </strong>
          );
        },
        em({ children }) {
          return <em className={`italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{children}</em>;
        },

        // ── Lists ────────────────────────────────────────────────────────────
        ul({ children }) {
          return <ul className={`list-disc list-inside space-y-1 mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{children}</ul>;
        },
        ol({ children }) {
          return <ol className={`list-decimal list-inside space-y-1 mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm leading-relaxed">{children}</li>;
        },

        // ── Horizontal rule ──────────────────────────────────────────────────
        hr() {
          return <hr className={`my-4 ${isDark ? 'border-gray-600' : 'border-gray-200'}`} />;
        },

        // ── Blockquote ───────────────────────────────────────────────────────
        blockquote({ children }) {
          return (
            <blockquote className={`border-l-4 pl-3 my-3 italic ${
              isDark ? 'border-violet-500 text-gray-300' : 'border-violet-300 text-gray-600'
            }`}>
              {children}
            </blockquote>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownContent;
