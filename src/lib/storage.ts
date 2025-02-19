import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  email: string;
  password: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  created_at: string;
  shared?: boolean;
}

class Storage {
  private usersPath = path.join(process.cwd(), 'data', 'users.json');
  private notesPath = path.join(process.cwd(), 'data', 'notes.json');
  private users: User[] = [];
  private notes: Note[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    if (!fs.existsSync(this.usersPath)) {
      fs.writeFileSync(this.usersPath, '[]');
    }
    if (!fs.existsSync(this.notesPath)) {
      fs.writeFileSync(this.notesPath, '[]');
    }
  }

  private loadData() {
    try {
      const usersData = fs.readFileSync(this.usersPath, 'utf-8');
      const notesData = fs.readFileSync(this.notesPath, 'utf-8');
      
      this.users = JSON.parse(usersData);
      this.notes = JSON.parse(notesData);
    } catch (error) {
      console.error('Error loading data:', error);
      this.users = [];
      this.notes = [];
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.usersPath, JSON.stringify(this.users, null, 2));
      fs.writeFileSync(this.notesPath, JSON.stringify(this.notes, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async signUp(email: string, password: string): Promise<User> {
    if (this.users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveData();
    return newUser;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    return user;
  }

  signOut() {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getNotes(): Note[] {
    if (!this.currentUser) return [];
    return this.notes.filter(note => note.userId === this.currentUser!.id);
  }

  getSharedNote(id: string): Note | null {
    const note = this.notes.find(n => n.id === id && n.shared);
    return note || null;
  }

  createNote(title: string, content: string): Note {
    if (!this.currentUser) throw new Error('Not authenticated');

    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      userId: this.currentUser.id,
      created_at: new Date().toISOString(),
      shared: false,
    };

    this.notes.push(note);
    this.saveData();
    return note;
  }

  updateNote(id: string, updates: Partial<Note>): Note {
    if (!this.currentUser) throw new Error('Not authenticated');

    const noteIndex = this.notes.findIndex(n => n.id === id && n.userId === this.currentUser!.id);
    if (noteIndex === -1) throw new Error('Note not found');

    this.notes[noteIndex] = { ...this.notes[noteIndex], ...updates };
    this.saveData();
    return this.notes[noteIndex];
  }

  deleteNote(id: string) {
    if (!this.currentUser) throw new Error('Not authenticated');

    this.notes = this.notes.filter(n => !(n.id === id && n.userId === this.currentUser!.id));
    this.saveData();
  }

  toggleNoteSharing(id: string): Note {
    if (!this.currentUser) throw new Error('Not authenticated');

    const note = this.notes.find(n => n.id === id && n.userId === this.currentUser!.id);
    if (!note) throw new Error('Note not found');

    note.shared = !note.shared;
    this.saveData();
    return note;
  }
}

export const storage = new Storage();
