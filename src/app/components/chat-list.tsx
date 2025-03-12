import { useNavigate } from "react-router-dom";
import DeleteIcon from "../icons/delete.svg";
import styles from "./home.module.scss";
import { Path } from "../constant";

import { useEffect } from "react";
import { Mask } from "../store/mask";
import { useChatStore } from "../store/chat";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: string;
  index: number;
  mask: Mask;
}) {
  return (
    <div
      className={styles["chat-item"]}
      onClick={props.onClick}
      title={props.title}
    >
      <>
          <div className={styles["chat-item-title"]}>{props.title}</div>
          <div className={styles["chat-item-info"]}>
            <div className={styles["chat-item-count"]}>
              {props.count}
            </div>
            <div className={styles["chat-item-date"]}>{props.time}</div>
          </div>
        </>

      <div
        className={styles["chat-item-delete"]}
        onClickCapture={(e) => {
          props.onDelete?.();
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DeleteIcon />
      </div>
    </div>

  );
}

export interface ChatSession {
  id: string;
  title: string;
  count: number;
  time: string;
}

export function ChatList() {

  const chatStore = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    chatStore.loadSessions();
  },[])

  return (
    <div
            className={styles["chat-list"]}
          >
            {chatStore.sessions.map((item, i) => (
              <ChatItem
              title={item.topic}
              time={new Date(item.lastUpdate).toLocaleString()}
              count={item.messages.length}
              key={item.id}
              id={item.id}
              index={i}
              selected={i === chatStore.currentSessionIndex}
              onClick={() => {
                navigate(Path.Chat);
                chatStore.selectSession(i);
              }}
              onDelete={async () => {
                chatStore.deleteSession(i);
              }}
              mask={item.mask}
            />
            ))}
          </div>
  );
}
