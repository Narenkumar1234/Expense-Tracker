import React from 'react';

interface MarkdownContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

// Lightweight, secure, elegant Markdown parser for Aura chat responses
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isUser = false,
  className = '',
}) => {
  if (!content) return null;

  // Split into lines
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let blockKey = 0;

  const flushList = () => {
    if (currentList) {
      const isOrdered = currentList.type === 'ol';
      const ListTag = isOrdered ? 'ol' : 'ul';
      blocks.push(
        <ListTag
          key={`list-${blockKey++}`}
          className={`my-2 space-y-1.5 pl-5 ${
            isOrdered ? 'list-decimal' : 'list-disc'
          } marker:text-emerald-600 dark:marker:text-[#4edea3] text-[13px]`}
        >
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed pl-1">
              {renderInlineMarkdown(item, isUser)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // Check unordered list item (* or - or •)
    const ulMatch = line.match(/^(\s*)[*\-•]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[2]);
      continue;
    }

    // Check ordered list item (1. 2.)
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // Not a list item: flush list
    flushList();

    if (!line.trim()) {
      // Empty line / paragraph break
      continue;
    }

    // Headings: ###
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      blocks.push(
        <h4
          key={`h3-${blockKey++}`}
          className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#dfe2f1] mt-3 mb-1"
        >
          {renderInlineMarkdown(h3Match[1], isUser)}
        </h4>
      );
      continue;
    }

    // Headings: ##
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      blocks.push(
        <h3
          key={`h2-${blockKey++}`}
          className="text-[13px] font-bold text-slate-900 dark:text-white mt-3 mb-1"
        >
          {renderInlineMarkdown(h2Match[1], isUser)}
        </h3>
      );
      continue;
    }

    // Headings: #
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      blocks.push(
        <h2
          key={`h1-${blockKey++}`}
          className="text-sm font-bold text-slate-900 dark:text-white mt-3.5 mb-1"
        >
          {renderInlineMarkdown(h1Match[1], isUser)}
        </h2>
      );
      continue;
    }

    // Normal paragraph
    blocks.push(
      <p key={`p-${blockKey++}`} className="leading-relaxed my-1">
        {renderInlineMarkdown(line, isUser)}
      </p>
    );
  }

  flushList();

  return (
    <div
      className={`text-[13px] ${
        isUser
          ? 'text-slate-900 dark:text-[#f1f3f9]'
          : 'text-slate-800 dark:text-[#dfe2f1]'
      } ${className}`}
    >
      {blocks}
    </div>
  );
};

// Helper to render bold, italic, code inline elements
function renderInlineMarkdown(text: string, isUser: boolean): React.ReactNode[] {
  // Regex to split by bold (**text**), inline code (`code`), or italic (*text*)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong
          key={i}
          className={`font-semibold ${
            isUser ? 'text-slate-950 dark:text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-white/10 text-emerald-700 dark:text-[#4edea3] font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em
          key={i}
          className={`italic ${
            isUser ? 'text-slate-800 dark:text-[#dfe2f1]' : 'text-slate-700 dark:text-[#bbcabf]'
          }`}
        >
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}
