import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const lastValueRef = useRef<string>(value || '');

  // Initialize content on mount and when value changes externally
  useEffect(() => {
    if (editorRef.current && !isUserTyping) {
      const newValue = value || '';
      // Only update if the value actually changed from outside
      if (lastValueRef.current !== newValue) {
        editorRef.current.innerHTML = newValue;
        lastValueRef.current = newValue;
      }
    }
  }, [value, isUserTyping]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      lastValueRef.current = newContent;
      onChange(newContent);
    }
  };

  const handleInput = () => {
    setIsUserTyping(true);
    updateContent();
  };

  const handleFocus = () => {
    setIsUserTyping(true);
  };

  const handleBlur = () => {
    setIsUserTyping(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        insertImageIntoEditor(imageData);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const insertImageIntoEditor = (imageSrc: string) => {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.margin = '1em 0';
    img.style.borderRadius = '8px';
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(img);
      
      // Add a line break after the image
      const br = document.createElement('br');
      range.collapse(false);
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (editorRef.current) {
      editorRef.current.appendChild(img);
    }
    
    updateContent();
  };

  const insertYouTubeVideo = () => {
    const url = prompt('Enter YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID):');
    if (url) {
      let videoId = '';
      
      // Extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        alert('Invalid YouTube URL. Please enter a valid YouTube video URL.');
        return;
      }
      
      const iframe = document.createElement('div');
      iframe.style.position = 'relative';
      iframe.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
      iframe.style.height = '0';
      iframe.style.margin = '1em 0';
      iframe.innerHTML = `<iframe 
        src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;"
      ></iframe>`;
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(iframe);
        
        // Add a line break after the video
        const br = document.createElement('br');
        range.collapse(false);
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (editorRef.current) {
        editorRef.current.appendChild(iframe);
      }
      
      updateContent();
    }
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', `<${tag}>`);
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
  ];

  const headingButtons = [
    { icon: Heading1, tag: 'h1', title: 'Heading 1' },
    { icon: Heading2, tag: 'h2', title: 'Heading 2' },
    { icon: Heading3, tag: 'h3', title: 'Heading 3' },
    { icon: Type, tag: 'p', title: 'Paragraph' },
  ];

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-[--color-stone-700]">
          {label}
        </label>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Toolbar */}
      <div className="bg-white border border-[--color-stone-300] rounded-t-lg p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 pr-2 border-r border-[--color-stone-200]">
          {toolbarButtons.map(({ icon: Icon, command, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              onMouseDown={(e) => e.preventDefault()}
              className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
              title={title}
            >
              <Icon size={16} className="text-[--color-stone-700]" />
            </button>
          ))}
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-2 border-r border-[--color-stone-200]">
          {headingButtons.map(({ icon: Icon, tag, title }) => (
            <button
              key={tag}
              type="button"
              onClick={() => formatBlock(tag)}
              onMouseDown={(e) => e.preventDefault()}
              className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
              title={title}
            >
              <Icon size={16} className="text-[--color-stone-700]" />
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-2 border-r border-[--color-stone-200]">
          {listButtons.map(({ icon: Icon, command, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => execCommand(command)}
              onMouseDown={(e) => e.preventDefault()}
              className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
              title={title}
            >
              <Icon size={16} className="text-[--color-stone-700]" />
            </button>
          ))}
        </div>

        {/* Link */}
        <button
          type="button"
          onClick={insertLink}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
          title="Insert Link"
        >
          <LinkIcon size={16} className="text-[--color-stone-700]" />
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={insertImage}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
          title="Insert Image"
        >
          <ImageIcon size={16} className="text-[--color-stone-700]" />
        </button>

        {/* YouTube Video */}
        <button
          type="button"
          onClick={insertYouTubeVideo}
          onMouseDown={(e) => e.preventDefault()}
          className="p-2 hover:bg-[--color-stone-100] rounded transition-colors"
          title="Embed YouTube Video"
        >
          <Video size={16} className="text-[--color-stone-700]" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="min-h-[200px] p-4 border border-[--color-stone-300] border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[--color-forest-600] bg-white prose prose-sm max-w-none relative"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          pointer-events: none;
        }
        [contenteditable] {
          outline: none;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        [contenteditable] p {
          margin: 0.5em 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }
        [contenteditable] li {
          margin: 0.25em 0;
        }
        [contenteditable] a {
          color: #1B4D2E;
          text-decoration: underline;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}