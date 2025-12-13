import { useEffect } from "react";
import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  autoConnect: false,
});

export function useSocketEvents(events) {
  useEffect(() => {
    if (!events) return undefined;

    for (const [eventName, handler] of Object.entries(events)) {
      socket.on(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(events)) {
        socket.off(eventName, handler);
      }
    };
  }, [events]);
}
