import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'java',       label: 'Java'       },
  { id: 'cpp',        label: 'C++'        },
];

const STARTERS = {
  javascript: `// Viết solution của bạn tại đây
function solution() {
  // TODO: implement
}

// Kiểm tra kết quả
console.log(solution());
`,
  typescript: `// Viết solution của bạn tại đây
function solution(): void {
  // TODO: implement
}

// Kiểm tra kết quả
console.log(solution());
`,
  python: `# Viết solution của bạn tại đây
def solution():
    # TODO: implement
    pass

# Kiểm tra kết quả
print(solution())
`,
  java: `// Viết solution của bạn tại đây
public class Solution {
    public static void main(String[] args) {
        // TODO: implement
    }
}
`,
  cpp: `// Viết solution của bạn tại đây
#include <iostream>
using namespace std;

int main() {
    // TODO: implement
    return 0;
}
`,
};

const CodeEditor = ({ value, onChange }) => {
  const [lang, setLang] = useState('javascript');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const editorRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;
    // Set starter code directly in editor without pushing to parent state.
    // Parent content stays '' until user actually types → allows skip detection.
    if (!value) {
      editor.setValue(STARTERS[lang]);
    }
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setShowLangMenu(false);
    // Only reset to starter if user hasn't meaningfully edited
    const current = editorRef.current?.getValue() ?? '';
    const isDefaultCode = Object.values(STARTERS).some((s) => s.trim() === current.trim());
    if (!current.trim() || isDefaultCode) {
      // Reset editor visually without touching parent content state
      editorRef.current?.setValue(STARTERS[newLang]);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      {/* Mac-like toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e1e] border-b border-gray-700">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 cursor-default" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-90 cursor-default" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-90 cursor-default" />
        </div>

        {/* File label */}
        <span className="text-xs text-gray-400 font-medium select-none">solution.{lang === 'javascript' ? 'js' : lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : lang === 'java' ? 'java' : 'cpp'}</span>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2d2d2d] hover:bg-[#3a3a3a] text-xs text-gray-300 transition-colors"
          >
            {LANGUAGES.find((l) => l.id === lang)?.label}
            <ChevronDown size={12} />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#252526] border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleLangChange(l.id)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    lang === l.id
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-300 hover:bg-[#2d2d2d]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={lang}
          theme="vs-dark"
          value={value || STARTERS[lang]}
          onMount={handleMount}
          onChange={(val) => onChange(val ?? '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            contextmenu: true,
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            formatOnType: false,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
