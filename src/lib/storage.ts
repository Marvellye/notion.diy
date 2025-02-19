interface User {
  id: string;
  email: string;
  password: string; // In production, this should be properly hashed
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
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
    return this.notes;
  }

  createNote(title: string, content: string): Note {
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      created_at: new Date().toISOString(),
    };

    this.notes.push(note);
    this.saveData();
    return note;
  }

  updateNote(id: string, updates: Partial<Note>): Note {
    const noteIndex = this.notes.findIndex(n => n.id === id);
    if (noteIndex === -1) throw new Error('Note not found');

    this.notes[noteIndex] = { ...this.notes[noteIndex], ...updates };
    this.saveData();
    return this.notes[noteIndex];
  }

  deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveData();
  }
}

export const storage = new Storage();
