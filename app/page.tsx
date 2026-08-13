import ReadingLogApp from "@/components/ReadingLogApp";
import Logo from "@/components/Logo";
import AppNav from "@/components/AppNav";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-24 pt-12 sm:py-20 sm:pb-24">
      <div className="w-full max-w-2xl">
        <header className="mb-6 flex justify-center text-center">
          <Logo />
        </header>
        <ReadingLogApp />
      </div>
      <AppNav />
    </main>
  );
}
