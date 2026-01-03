
'use client';

import React from 'react';

interface FormattedResponseProps {
  text: string;
}

const parseBold = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

export function FormattedResponse({ text }: FormattedResponseProps) {
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, pIndex) => {
        const lines = paragraph.split('\n');
        const isList = lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));

        if (isList) {
          return (
            <ul key={pIndex} className="list-disc list-outside space-y-1 pl-5">
              {lines.map((line, lIndex) => (
                <li key={lIndex} className="text-foreground/90">
                  {parseBold(line.replace(/^[*-]\s/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={pIndex} className="text-foreground/90">
            {lines.map((line, lIndex) => (
              <React.Fragment key={lIndex}>
                {parseBold(line)}
                {lIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
