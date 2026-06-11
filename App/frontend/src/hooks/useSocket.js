import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const [snapshot, setSnapshot] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || undefined);

    socket.on('tower:snapshot', setSnapshot);
    socket.on('tower:event', (event) => {
      setEvents((current) => [event, ...current].slice(0, 8));
    });

    return () => socket.disconnect();
  }, []);

  return { snapshot, events };
}

