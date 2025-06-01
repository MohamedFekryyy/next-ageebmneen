import { Wizard } from '@/components/Wizard';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <Wizard />
      </div>
    </div>
  );
}
