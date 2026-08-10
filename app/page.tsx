import ReadingLogApp from "@/components/ReadingLogApp";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            読書クエスト
          </h1>
        </header>
        <ReadingLogApp />
      </div>
    </main>
  );
}
