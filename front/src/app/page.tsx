
"use client";

import BasicSlider from "./components/BasicSlider/Swiper";
import styles from "./page.module.css";
import { Mediapipe } from "./components/Detection/Mediapipe";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Mediapipe />
      <BasicSlider />
    </div>
  );
}
