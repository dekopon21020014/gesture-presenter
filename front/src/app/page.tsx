
"use client";

import BasicSlider from "./components/BasicSlider";
import styles from "./page.module.css";
import { Mediapipe } from "./Recording/Mediapipe";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Mediapipe />
      <BasicSlider />
    </div>
  );
}
