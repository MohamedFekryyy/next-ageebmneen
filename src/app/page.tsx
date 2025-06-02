import { Wizard } from '@/components/Wizard';
import { Footer } from '@/components/Footer';
import { PopularLinks } from '@/components/PopularLinks';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-100">
      <div className="flex-1">
        <Wizard />
      </div>
      <PopularLinks />
      <Footer />
    </div>
  );
}
