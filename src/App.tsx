import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, File, Trash2, Menu, Download } from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown-preview';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNewNote = () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '',
      created_at: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    saveNotesToStorage(updatedNotes);
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const updateNote = () => {
    if (!selectedNote) return;

    const updatedNotes = notes.map((note) =>
      note.id === selectedNote.id
        ? { ...note, title, content }
        : note
    );

    saveNotesToStorage(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotesToStorage(updatedNotes);

    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin support
    });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    //const imgProps = pdf.getImageProperties(data); // Remove this line
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (pdfWidth * canvas.height) / canvas.width; // Calculate height based on aspect ratio

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${title || 'note'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background font-sfpro">
      {/* Navbar */}
      <div className="bg-secondary border-b">
        <div className="container mx-auto py-2 px-4 flex items-center justify-between">
          <span className="font-bold text-lg">notion.diy</span>
          <Button asChild>
            <a href="https://marvelly.com.ng" target="_blank" rel="noopener noreferrer">
              Dev
            </a>
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden mb-4">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:block">
                <SheetHeader>
                  <SheetTitle>Notes</SheetTitle>
                  <SheetDescription>
                    Manage your notes here.
                  </SheetDescription>
                </SheetHeader>
                <Card className="p-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-2rem)] border-none shadow-none">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">All Notes</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={createNewNote}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[calc(100vh-16rem)] md:h-[calc(100vh-8rem)]">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </SheetContent>
            </Sheet>
            <Card className="hidden md:block p-4 h-[calc(100vh-2rem)] border-none shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Notes</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={createNewNote}
                >
                  <Plus className="h-5 w-5" />
                </Button>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="col-span-12 md:col-span-9 p-4 h-[calc(100vh-2rem)]">
            {selectedNote ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      updateNote();
                    }}
                    placeholder="Note title"
                    className="text-xl font-semibold border-none focus-visible:ring-0"
                  />
                  <Button variant="outline" size="icon" onClick={exportToPDF}>
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
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
                      <div ref={previewRef} className="hidden">
                        <MarkdownPreview content={content} />
                      </div>
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

export default App;
