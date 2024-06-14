"use client";

import BasicSlider from "./components/BasicSlider";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
        <BasicSlider />
    </div>
  );
}
