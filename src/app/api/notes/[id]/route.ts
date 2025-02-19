export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return new Response(JSON.stringify({ message: "Hello" }));
}
