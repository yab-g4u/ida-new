export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full bg-muted/40">
      <main className="flex flex-col h-full">
        {children}
      </main>
    </div>
  );
}
