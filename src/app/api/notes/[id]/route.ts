import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note, User } from '@/lib/storage';

const notesPath = path.join(process.cwd(), 'data', 'notes.json');

function loadData() {
  try {
    const notesData = fs.readFileSync(notesPath, 'utf-8');
    return {
      notes: JSON.parse(notesData) as Note[],
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return { notes: [] };
  }
}

function saveData(notes: Note[]) {
  try {
    fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

interface Params {
  id: string;
}

interface Props {
  params: Params;
}

export async function PUT(request: Request, { params }: Props) {
  const { id } = params;
  const { shared } = await request.json();

  if (typeof shared !== 'boolean') {
    return NextResponse.json({ error: 'Invalid shared value' }, { status: 400 });
  }

  let { notes } = loadData();
  const noteIndex = notes.findIndex(note => note.id === id);

  if (noteIndex === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  notes[noteIndex] = { ...notes[noteIndex], shared };
  saveData(notes);

  return NextResponse.json(notes[noteIndex]);
}

export async function GET(request: Request, { params }: Props) {
    const { id } = params;
  
    let { notes } = loadData();
    const note = notes.find(n => n.id === id && n.shared === true);
  
    if (!note) {
      return NextResponse.json({ error: 'Note not found or not shared' }, { status: 404 });
    }
  
    return NextResponse.json(note);
  }
