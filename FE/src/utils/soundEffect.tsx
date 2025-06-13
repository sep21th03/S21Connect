import { useEffect, useState, useCallback } from 'react';

export class SoundNotification {
    private audio: HTMLAudioElement | null = null;
    private isEnabled: boolean = true;
  
    constructor(soundUrl?: string) {
      if (soundUrl) {
        this.audio = new Audio(soundUrl);
      } else {
        this.createDefaultNotificationSound();
      }
      
      if (this.audio) {
        this.audio.volume = 0.5; 
        this.audio.preload = 'auto';
      }
    }
  
    private createDefaultNotificationSound() {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const sampleRate = audioContext.sampleRate;
      const duration = 0.3; 
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);
  
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        if (t < 0.1) {
          data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 10) * 0.3;
        } else if (t < 0.2) {
          data[i] = Math.sin(2 * Math.PI * 1000 * (t - 0.1)) * Math.exp(-(t - 0.1) * 10) * 0.3;
        } else {
          data[i] = 0;
        }
      }
  
      const offlineContext = new OfflineAudioContext(1, buffer.length, sampleRate);
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start();
  
      offlineContext.startRendering().then((renderedBuffer) => {
        const audioData = renderedBuffer.getChannelData(0);
        const wavBlob = this.bufferToWav(audioData, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        this.audio = new Audio(audioUrl);
        this.audio.volume = 0.5;
      });
    }
  
    private bufferToWav(buffer: Float32Array, sampleRate: number): Blob {
      const length = buffer.length;
      const arrayBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(arrayBuffer);
  
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
  
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
  
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, buffer[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
  
      return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
  
    async play() {
      if (!this.isEnabled || !this.audio) return;
  
      try {
        this.audio.currentTime = 0;
        await this.audio.play();
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  
    setVolume(volume: number) {
      if (this.audio) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
      }
    }
  
    enable() {
      this.isEnabled = true;
    }
  
    disable() {
      this.isEnabled = false;
    }
  
    isNotificationEnabled(): boolean {
      return this.isEnabled;
    }
    
    static async requestNotificationPermission(): Promise<boolean> {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
      }
  
      if (Notification.permission === 'granted') {
        return true;
      }
  
      if (Notification.permission === 'denied') {
        return false;
      }
  
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  
    static showDesktopNotification(title: string, options?: NotificationOptions) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/favicon.ico', 
          badge: '/favicon.ico',
          ...options
        });
      }
    }
  }
  
  export const useSoundNotification = (soundUrl?: string) => {
    const [soundNotification] = useState(() => new SoundNotification(soundUrl));
    const [isEnabled, setIsEnabled] = useState(true);
  
    useEffect(() => {
      if (isEnabled) {
        soundNotification.enable();
      } else {
        soundNotification.disable();
      }
    }, [isEnabled, soundNotification]);
  
    const playNotificationSound = useCallback(() => {
      soundNotification.play();
    }, [soundNotification]);
  
    const setVolume = useCallback((volume: number) => {
      soundNotification.setVolume(volume);
    }, [soundNotification]);
  
    const toggleSound = useCallback(() => {
      setIsEnabled(prev => !prev);
    }, []);
  
    return {
      playNotificationSound,
      setVolume,
      toggleSound,
      isEnabled,
      setIsEnabled
    };
  };