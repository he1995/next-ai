import { ChatMessage, DEFAULT_MASK_AVATAR, Mask } from "./mask";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Locale from "../locales";


export function createMessage(override: Partial<ChatMessage>): ChatMessage {
    return {
        id: nanoid(),
        date: new Date().toLocaleString(),
        role: "user",
        content: "",
        ...override,
    };
}


export interface ChatSession {
    id: string;
    topic: string;
    messages: ChatMessage[];
    createTime: number;
    lastUpdate: number;
    mask: Mask;
}

/**
 * {
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }
 */
export interface Message {
    role: String,
    content: String
}
export interface chatRequest {
    model: String,
    messages: Message[],
    stream: boolean
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
    role: "assistant",
    content: Locale.Store.BotHello,
});

export const createEmptyMask = () =>
    ({
        id: nanoid(),
        avatar: DEFAULT_MASK_AVATAR,
        name: DEFAULT_TOPIC,
        context: [],
    }) as Mask;

function createEmptySession(): ChatSession {
    return {
        id: nanoid(),
        topic: DEFAULT_TOPIC,
        messages: [],
        createTime: Date.now(),
        lastUpdate: Date.now(),
        mask: createEmptyMask(),
    };
}

export interface ChatState {
    sessions: ChatSession[];
    currentSessionIndex: number;
    loadSessions(): void;
    deleteSession(i: number): unknown;
    selectSession: (index: number) => void;
    newSession: (mask?: Mask) => void;
    currentSession: () => ChatSession;
    chat(prompt: string): void;
}

function getServerURL() {
    return "http://localhost:8080"
}

function uploadMessage(session: ChatSession, message: ChatMessage) {
    return fetch(getServerURL() + "/session/message/add?sessionId=" + session.id,
        {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message)
        })
}


export const useChatStore = create<ChatState>()(
    persist((set, get) => ({
        sessions: [createEmptySession()],
        currentSessionIndex: 0,

        loadSessions() {
            fetch(getServerURL() + "/session/all")
                .then((res) => {
                    return res.json();
                }).then((sessions: []) => {
                    if (sessions.length > 0) {
                        set((state) => ({
                            sessions: sessions
                        }));
                    }
                }).catch(e => {
                    console.error(e);
    
                })
        },

        selectSession(index: number) {
            set({
                currentSessionIndex: index,
            });
        },

        newSession(mask?: Mask) {
            const session = createEmptySession();

            if (mask) {
                session.mask = mask;
                session.topic = mask.name;
            }

            fetch(getServerURL() + "/session/add",
                {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(session)
                }).then((res) => {
                    set((state) => ({
                        currentSessionIndex: 0,
                        sessions: [session].concat(state.sessions),
                    }));
                }).catch(e => {
                    console.error(e);
                })
        },

        deleteSession(index: number) {
            //the last one
            const deletingLastSession = get().sessions.length === 1;
            const deletedSession = get().sessions.at(index);
            if (!deletedSession) return;

            fetch(
                getServerURL() + "/session/delete?sessionId=" + deletedSession.id,
                { method: "post" }
            ).then((res) => {
                const sessions = get().sessions.slice();
                sessions.splice(index, 1);
 
                const currentIndex = get().currentSessionIndex;
                let nextIndex = Math.min(
                    currentIndex - Number(index < currentIndex),
                    sessions.length - 1,
                );
                if (deletingLastSession) {
                    nextIndex = 0;
                    sessions.push(createEmptySession());
                }
                set(() => ({
                    currentSessionIndex: nextIndex,
                    sessions,
                }));

            }).catch((e) => {
                console.error(e);
            })
        },

        currentSession() {
            let index = get().currentSessionIndex;
            const sessions = get().sessions;

            if (index < 0 || index >= sessions.length) {
                index = Math.min(sessions.length - 1, Math.max(0, index));
                set(() => ({ currentSessionIndex: index }));
            }

            const session = sessions[index];

            return session;
        },

        chat(prompt) {
            const request: chatRequest = { 
                model: "deepseek-chat", 
                messages: [ 
                    { role: "system", content: "you are a helpful assistant"}, 
                    { role: "user", content: prompt}
                ],
                stream: false,
            }

            const chatMessage: ChatMessage = {id: "001", content: prompt, role: "user", date: new Date().toDateString()};
            uploadMessage(this.currentSession(), chatMessage);

            fetch(process.env.NEXT_PUBLIC_OPEN_URL + "/chat/completions",
                {
                    method: "post",
                    headers: { "Content-Type": "application/json", "Authorization" : "Bearer " + process.env.NEXT_PUBLIC_API_KEY },
                    body: JSON.stringify(request)
                }).then((res) => {
                    return res.json();
                }).then((data) => {
                    console.log("=========================================================");
                    console.log(data);
                    const response = data.choices[0].message;
                    const resMessage: ChatMessage = {id: Math.random().toString(), content: response.content, role: "assistant", date: new Date().toDateString()};
                    uploadMessage(this.currentSession(), resMessage);

                }).catch(e => {
                    console.error(e);
                })
        },

    }),
        { name: "chat-session" }
    ))