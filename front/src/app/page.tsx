import Image from "next/image";
import { Mediapipe } from "./Recording/Mediapipe";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Mediapipe></Mediapipe>
    </main>
  );
}
