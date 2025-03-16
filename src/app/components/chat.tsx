import { useState } from "react";
import { useChatStore } from "../store/chat";

export default function ChatPage() {
    const chatStore = useChatStore();
    const [userInput, setUserInput] = useState("");

    function onInput(str: string) {
      setUserInput(str)
    }

    return (
      <div>
        <textarea
                        id="chat-input"
                        onInput={(e) => onInput(e.currentTarget.value)}
                        value={userInput}
                        autoFocus={true}
                        style={{
            
                          
                        }}
                    />
      <button onClick={() => chatStore.chat(userInput)}>Send</button>
      </div>
      
    );
  }