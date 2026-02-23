import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

const API_URL = import.meta.env.VITE_API_URL.replace('/api/v1', '');

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio - using 'positive-notification-951'
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3');
    audioRef.current.load();
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      // Many browsers require a user interaction before playing sound. 
      // The first click on the dashboard usually unlocks this.
      const promise = audioRef.current.play();
      if (promise !== undefined) {
          promise.catch(e => {
              console.warn('Auto-play was prevented. Sound will play after first user interaction.', e);
          });
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = io(API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join-room', user.id);
      });

      socket.on('notification', (data: any) => {
        console.log('New notification:', data);
        playNotificationSound();
        toast.success(data.title, {
          description: data.message,
          duration: 5000,
        });
      });

      socket.on('new-deposit', (data: any) => {
        if (user.role === 'ADMIN' || user.role === 'AGENT') {
          playNotificationSound();
          toast.info('New Deposit Received', {
            description: `${data.username} deposited $${data.amount} via ${data.gateway}`,
            duration: 5000,
          });
        }
      });

      socketRef.current = socket;

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
