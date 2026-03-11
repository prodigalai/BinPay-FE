import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "") || "http://localhost:5000";
const API_URL = API_BASE;

const NOTIFICATION_DEBOUNCE_MS = 2500;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastNotificationKeyRef = useRef<string | null>(null);
  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    // Initialize audio - using 'positive-notification-951'
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
    audioRef.current.load();

    // 1. Request Browser Notification Permission (for the popup)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 2. Audio "Unlocker" for Browsers
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);

    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        console.warn('Audio play failed (interaction needed):', e);
      });

      // Browser Notification logic (if user allowed)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pay4Edge Update", {
          body: "New notification received in your dashboard",
          icon: "/favicon.ico"
        });
      }
    }
  };

  const isDuplicateNotification = (key: string): boolean => {
    const now = Date.now();
    if (lastNotificationKeyRef.current === key && now - lastNotificationTimeRef.current < NOTIFICATION_DEBOUNCE_MS) {
      return true;
    }
    lastNotificationKeyRef.current = key;
    lastNotificationTimeRef.current = now;
    return false;
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join-room', user.id);
    });

    socket.on('notification', (data: any) => {
      const key = `notification-${data.orderId ?? data.title}-${data.message}`;
      if (isDuplicateNotification(key)) return;
      console.log('New notification:', data);
      playNotificationSound();
      toast.success(data.title ?? 'Notification', {
        description: data.message,
        duration: 5000,
      });
    });

    socket.on('new-deposit', (data: any) => {
      if (user.role !== 'ADMIN' && user.role !== 'AGENT') return;
      const key = `new-deposit-${data.username}-${data.amount}-${data.gateway}`;
      if (isDuplicateNotification(key)) return;
      playNotificationSound();
      toast.info('New Deposit Received', {
        description: `${data.username} deposited $${data.amount} via ${data.gateway}`,
        duration: 5000,
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
