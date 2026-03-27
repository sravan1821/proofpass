export function PrototypeFrame({ src, title }: { src: string; title: string }) {
  return (
    <main className="h-screen w-full bg-white">
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-0"
        loading="eager"
      />
    </main>
  );
}
