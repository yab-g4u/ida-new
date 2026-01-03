export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full">
      <main className="flex flex-col h-full">
        {children}
      </main>
    </div>
  );
}
