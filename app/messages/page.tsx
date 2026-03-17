import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MessagesContent } from "@/components/messages-content";

export const metadata = { title: "Messages - HireACreator" };

export default function MessagesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-50 pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <MessagesContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
