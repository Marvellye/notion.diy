'use client'
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, File, Trash2, Share2, LogOut } from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown-preview';
import { AuthForm } from '@/components/auth-form';
import { storage, User, Note } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const { toast } = useToast();
  const user = storage.getCurrentUser();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?userId=${user!.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast({
        title: "Error fetching notes",
        description: error instanceof Error ? error.message : "Failed to fetch notes",
        variant: "destructive",
      });
    }
  };

  const createNewNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Untitled', content: '', userId: user!.id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newNote = await response.json();
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content);
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Error creating note",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const updateNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedNote.id, title, content }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedNote = await response.json();
      setNotes(notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error updating note",
        description: error instanceof Error ? error.message : "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error deleting note",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  const toggleShare = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shared: !note.shared }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedNote = await response.json();
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
      toast({
        title: "Error toggling share",
        description: error instanceof Error ? error.message : "Failed to toggle share",
        variant: "destructive",
      });
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
