import { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiSelectProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiSelect({ value, onChange }: EmojiSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 420); // picker height ~400 + margin
    }
  }, [open]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <span className="text-xl">{value || '🙂'}</span>
        <span className="text-gray-600">Choose emoji</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>
      {open && (
        <div
          className={`absolute z-20 left-0 w-[320px] h-[400px] overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-white ${
            dropUp ? 'bottom-full mb-2' : 'mt-2'
          }`}
        >
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              onChange(emoji.native);
              setOpen(false);
            }}
            theme="light"
            searchPosition="sticky"
            dynamicWidth={false}
            maxFrequentRows={1}
            previewPosition="none"
            emojiSize={24}
            perLine={8}
          />
        </div>
      )}
    </div>
  );
}
