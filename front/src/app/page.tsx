
"use client";

import BasicSlider from "./components/BasicSlider/BasicSlider";
import styles from "./page.module.css";
import { Mediapipe } from "./components/Detection/Mediapipe";
import Top from "./top/page";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Top />
    </div>
  );
}
