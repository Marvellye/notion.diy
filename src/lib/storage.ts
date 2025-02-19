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

// This file is now only for types
export type { User, Note };
