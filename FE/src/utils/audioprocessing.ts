export const processAudioFile = async (audioFile: File, videoDuration?: number): Promise<Blob> => {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(await audioFile.arrayBuffer());
    
    if (videoDuration) {
      // If combining with video, match the video duration
      const adjustedBuffer = await adjustAudioDuration(audioContext, audioBuffer, videoDuration);
      return await audioBufferToBlob(audioContext, adjustedBuffer);
    }
    
    return await audioBufferToBlob(audioContext, audioBuffer);
  };

 export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  export const adjustAudioDuration = async (
    audioContext: AudioContext, 
    audioBuffer: AudioBuffer, 
    targetDuration: number
  ): Promise<AudioBuffer> => {
    const sampleRate = audioBuffer.sampleRate;
    const targetSamples = Math.floor(targetDuration * sampleRate);
    const originalSamples = audioBuffer.length;
    
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      targetSamples,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      
      if (targetSamples <= originalSamples) {
        // Trim audio
        for (let i = 0; i < targetSamples; i++) {
          newChannelData[i] = channelData[i];
        }
      } else {
        // Loop audio to match duration
        for (let i = 0; i < targetSamples; i++) {
          newChannelData[i] = channelData[i % originalSamples];
        }
      }
    }

    return newBuffer;
  };

    export const audioBufferToBlob = async (audioContext: AudioContext, buffer: AudioBuffer): Promise<Blob> => {
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to WAV format
    const wavArrayBuffer = audioBufferToWav(renderedBuffer);
    return new Blob([wavArrayBuffer], { type: 'audio/wav' });
  };

  export const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // PCM samples
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  export const combineVideoWithAudio = async (videoFile: File, audioBlob: Blob): Promise<File> => {
    // This is a simplified approach - in production, you'd use FFmpeg.js or server-side processing
    // For now, we'll create a new file with metadata indicating music should be added
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('audio', audioBlob, 'background_music.wav');
    
    // Return original video file with flag for backend processing
    const processedFile = new File([videoFile], videoFile.name, {
      type: videoFile.type,
      lastModified: videoFile.lastModified
    });
    
    // Add custom property to indicate music processing needed
    (processedFile as any).hasBackgroundMusic = true;
    (processedFile as any).backgroundAudio = audioBlob;
    
    return processedFile;
  };

  export const downloadTrack = async (track: any): Promise<File> => {
    try {
      const response = await fetch(track.preview_url || track.url);
      if (!response.ok) throw new Error('Failed to download track');
      
      const blob = await response.blob();
      return new File([blob], `${track.name}.mp3`, { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Error downloading track:', error);
      throw error;
    }
  };

  export const processMediaWithMusic = async (mediaFile: File, track: any): Promise<File> => {
    try {
      // Download the selected track
      const audioFile = await downloadTrack(track);
      
      if (mediaFile.type.startsWith('video/')) {
        // For video: combine with background music
        const videoDuration = await getVideoDuration(mediaFile);
        const audioBlob = await processAudioFile(audioFile, videoDuration);
        return await combineVideoWithAudio(mediaFile, audioBlob);
      } else {
        // For image: we'll send both files and let backend create video with music
        const processedFile = new File([mediaFile], mediaFile.name, {
          type: mediaFile.type,
          lastModified: mediaFile.lastModified
        });
        
        (processedFile as any).hasBackgroundMusic = true;
        (processedFile as any).backgroundAudio = await processAudioFile(audioFile);
        (processedFile as any).musicName = track.name;
        (processedFile as any).artistName = track.artist_name;
        
        return processedFile;
      }
    } catch (error) {
      console.error('Error processing media with music:', error);
      throw error;
    }
  };