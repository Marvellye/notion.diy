import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, File, Trash2, Share2, LogOut } from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown-preview';
import { AuthForm } from '@/components/auth-form';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  created_at: string;
  shared?: boolean;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const { toast } = useToast();
  const user = storage.getCurrentUser();

  useEffect(() => {
    if (user) {
      setNotes(storage.getNotes());
    }
  }, [user]);

  const createNewNote = () => {
    try {
      const newNote = storage.createNote('Untitled', '');
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const updateNote = () => {
    if (!selectedNote) return;

    try {
      const updatedNote = storage.updateNote(selectedNote.id, { title, content });
      setNotes(notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = (id: string) => {
    try {
      storage.deleteNote(id);
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleShare = (note: Note) => {
    try {
      const updatedNote = storage.toggleNoteSharing(note.id);
      setNotes(notes.map((n) => n.id === note.id ? updatedNote : n));
      
      if (updatedNote.shared) {
        const shareUrl = `${window.location.origin}/share/${note.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Share link copied!",
          description: "The note's share link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Sidebar */}
          <Card className="col-span-3 p-4 h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={createNewNote}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    storage.signOut();
                    window.location.reload();
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg cursor-pointer group',
                      selectedNote?.id === note.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => {
                      setSelectedNote(note);
                      setTitle(note.title);
                      setContent(note.content);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm truncate">{note.title}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShare(note);
                        }}
                      >
                        <Share2 className={cn("h-4 w-4", note.shared && "text-blue-500")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Main Content */}
          <Card className="col-span-9 p-4 h-[calc(100vh-2rem)]">
            {selectedNote ? (
              <div className="h-full flex flex-col">
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    updateNote();
                  }}
                  placeholder="Note title"
                  className="text-xl font-semibold mb-4 border-none focus-visible:ring-0"
                />
                <Tabs defaultValue="edit" className="flex-grow">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="flex-grow mt-0">
                    <ScrollArea className="h-[calc(100vh-12rem)]">
                      <textarea
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value);
                          updateNote();
                        }}
                        placeholder="Start writing your note... Use Markdown syntax for formatting"
                        className="w-full h-full p-2 bg-transparent border-none focus:outline-none resize-none"
                      />
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="preview" className="flex-grow mt-0">
                    <ScrollArea className="h-[calc(100vh-12rem)] p-4">
                      <MarkdownPreview content={content} />
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No note selected
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select a note from the sidebar or create a new one
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App
