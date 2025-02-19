import { useEffect, useState } from 'react';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const formatMarkdown = (text: string) => {
      // Headers
      let formatted = text
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>');

      // Bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Lists
      formatted = formatted.replace(/^\- (.*$)/gm, '<li>$1</li>');
      formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

      // Code blocks
      formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

      // Line breaks
      formatted = formatted.replace(/\n/g, '<br>');

      return formatted;
    };

    setHtml(formatMarkdown(content));
  }, [content]);

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
