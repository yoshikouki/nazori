import { DrawingCanvas } from "./drawing-canvas";

export default function Home() {
  return (
    <div>
      <main className="fixed inset-0 flex items-center justify-center">
        <DrawingCanvas />
      </main>
    </div>
  );
}
