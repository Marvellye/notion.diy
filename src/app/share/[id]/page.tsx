import { SharedNote } from '@/components/shared-note';

interface Params {
  id: string;
}

interface Props {
  params: Params;
}

export default function SharedNotePage({ params }: Props) {
  const { id } = params;
  return <SharedNote noteId={id} />;
}
