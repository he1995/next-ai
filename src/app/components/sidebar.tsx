import styles from "./home.module.scss";

import ChatGptIcon from "../icons/chatgpt.svg";
import { useNavigate } from "react-router-dom";

export function SideBar() {

  const navigate = useNavigate();

  return (
    <div
      className={styles.sidebar}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          NextAI
        </div>
        <div className={styles["sidebar-sub-title"]}>
          Build your own AI assistant.
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <ChatGptIcon />
        </div>
      </div>

      <button
        className={styles["new-chat-button"]}
        onClick={() => {
          navigate("/")
        }}
      >新建聊天</button>

      <div
        className={styles["sidebar-body"]}
      >
        <h1 onClick={() => navigate("/chat")}>小红书写手</h1>
        <h1>心灵导师</h1>
        <h1>小红书写手</h1>
        <h1>心灵导师</h1>
        <h1>小红书写手</h1>
        <h1>心灵导师</h1>
      </div>
    </div>
  );
}
