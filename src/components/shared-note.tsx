import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownPreview } from '@/components/markdown-preview';
import { storage } from '@/lib/storage';

interface SharedNoteProps {
  noteId: string;
}

export function SharedNote({ noteId }: SharedNoteProps) {
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sharedNote = storage.getNotes().find(note => note.id === noteId);
    setNote(sharedNote);
    setLoading(false);
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Note not found or not shared</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <MarkdownPreview content={note.content} />
        </ScrollArea>
      </Card>
    </div>
  );
}
