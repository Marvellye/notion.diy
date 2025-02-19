import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User, Note } from '@/lib/storage';

const usersPath = path.join(process.cwd(), 'data', 'users.json');
const notesPath = path.join(process.cwd(), 'data', 'notes.json');

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, '[]');
  }
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, '[]');
  }
}

function loadData() {
  ensureDataDirectory();
  try {
    const usersData = fs.readFileSync(usersPath, 'utf-8');
    const notesData = fs.readFileSync(notesPath, 'utf-8');
    return {
      users: JSON.parse(usersData) as User[],
      notes: JSON.parse(notesData) as Note[],
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { users: [], notes: [] };
  }
}

function saveData(users: User[], notes: Note[]) {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const { notes } = loadData();
  const userNotes = notes.filter(note => note.userId === userId);
  return NextResponse.json(userNotes);
}

export async function POST(request: Request) {
  const { title, content, userId } = await request.json();

  if (!userId || !title) {
    return NextResponse.json({ error: 'userId and title are required' }, { status: 400 });
  }

  let { users, notes } = loadData();

  const newNote: Note = {
    id: crypto.randomUUID(),
    title,
    content,
    userId,
    created_at: new Date().toISOString(),
    shared: false,
  };

  notes.push(newNote);
  saveData(users, notes);

  return NextResponse.json(newNote, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, title, content } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  let { users, notes } = loadData();
  const noteIndex = notes.findIndex(note => note.id === id);

  if (noteIndex === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  notes[noteIndex] = { ...notes[noteIndex], title, content };
  saveData(users, notes);

  return NextResponse.json(notes[noteIndex]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  let { users, notes } = loadData();
  notes = notes.filter(note => note.id !== id);
  saveData(users, notes);

  return new Response(null, { status: 204 });
}
