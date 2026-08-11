import ReadingLogApp from "@/components/ReadingLogApp";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl">
        <header className="mb-10 flex justify-center text-center">
          <Logo />
        </header>
        <ReadingLogApp />
      </div>
    </main>
  );
}
