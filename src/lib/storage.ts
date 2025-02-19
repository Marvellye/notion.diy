interface User {
  id: string;
  email: string;
  password: string; // In production, this should be properly hashed
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
  private users: User[] = [];
  private notes: Note[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadData();
  }

  private loadData() {
    const usersData = localStorage.getItem('users');
    const notesData = localStorage.getItem('notes');
    
    if (usersData) this.users = JSON.parse(usersData);
    if (notesData) this.notes = JSON.parse(notesData);
    
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) this.currentUser = JSON.parse(currentUserData);
  }

  private saveData() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('notes', JSON.stringify(this.notes));
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  async signUp(email: string, password: string): Promise<User> {
    if (this.users.some(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password, // In production, this should be hashed
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
    this.saveData();
    return user;
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
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
