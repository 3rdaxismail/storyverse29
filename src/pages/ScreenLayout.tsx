import React from "react";
import HeaderBar from "../components/header/HeaderBar";
import styles from "./ScreenLayout.module.css";

interface ScreenLayoutProps {
  children: React.ReactNode;
}

const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children }) => {
  return (
    <div className={styles.screenLayoutRoot}>
      <HeaderBar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default ScreenLayout;
