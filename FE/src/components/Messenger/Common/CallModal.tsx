import React, { FC, useEffect, useRef, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { ImagePath } from "../../../utils/constant";
import Image from "next/image";

export const CallModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  isVideo: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  isConnected: boolean;
  onEndCall: () => void;
  userName: string;
}> = ({
  isOpen,
  onClose,
  isVideo,
  remoteStream,
  localStream,
  isConnected,
  onEndCall,
  userName,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!remoteStream) return;
    if (remoteStream.getAudioTracks().length === 0) return;

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const source = audioContext.createMediaStreamSource(remoteStream);
    source.connect(analyser);

    let animationId: number;
    const updateVolume = () => {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setVolumeLevel(rms);
      animationId = requestAnimationFrame(updateVolume);
    };
    updateVolume();

    return () => {
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
      cancelAnimationFrame(animationId);
    };
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isConnected) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isConnected, isOpen]);

  useEffect(() => {
    if (localStream) {
      console.log("localStream video tracks:", localStream.getVideoTracks());
    }
    if (remoteStream) {
      console.log("remoteStream video tracks:", remoteStream.getVideoTracks());
    }
  }, [localStream, remoteStream]);

  const formatDuration = (seconds: number) => {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = (seconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  if (!isOpen) return null;

  return (
    <div className="call-modal-overlay">
      <div className="call-modal">
        <div className="call-header">
          <h3>{userName}</h3>
          <p>{isConnected ? "Connected" : "Connecting..."}</p>
          {isConnected && (
            <div style={{ fontSize: 16, color: "#42b883", marginTop: 4 }}>
              {formatDuration(callDuration)}
            </div>
          )}
        </div>

        <div className="call-content">
          {isVideo && (
            <>
              {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video"
                />
              ) : (
                <div
                  style={{ color: "#fff", textAlign: "center", marginTop: 40 }}
                >
                  Đang chờ video...
                </div>
              )}
              {localStream && (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
              )}
            </>
          )}

          {!isVideo && (
            <div className="audio-call-ui">
              <div className="avatar-large">
                <Image
                  src={`${ImagePath}/icon/user.png`}
                  alt={userName}
                  width={120}
                  height={120}
                  className="rounded-circle"
                />
              </div>
            </div>
          )}

          {remoteStream && remoteStream.getAudioTracks().length > 0 && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div
                style={{
                  width: 120,
                  height: 10,
                  background: "#eee",
                  borderRadius: 5,
                  margin: "0 auto",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(volumeLevel * 100, 100)}%`,
                    height: "100%",
                    background: "#42b883",
                    transition: "width 0.1s",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Volume: {(volumeLevel * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        <div className="call-controls">
          <button className="btn-end-call" onClick={onEndCall}>
            <DynamicFeatherIcon iconName="PhoneOff" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .call-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .call-modal {
          background: white;
          border-radius: 12px;
          width: 90vw;
          max-width: 600px;
          height: 80vh;
          max-height: 500px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .call-header {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #eee;
          flex-shrink: 0;
        }

        .call-header h3 {
          margin: 0;
          font-weight: 600;
        }

        .call-header p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .call-content {
          flex: 1 1 0;
          position: relative;
          background: #000;
          min-height: 200px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .local-video {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 150px;
          height: 100px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid white;
        }

        .audio-call-ui {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .avatar-large {
          text-align: center;
        }

        .call-controls {
          padding: 20px;
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-shrink: 0;
          background: white;
        }

        .btn-end-call {
          background: #dc3545;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-end-call:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export const IncomingCallModal: FC<{
  isOpen: boolean;
  callerName: string;
  callType: "audio" | "video";
  onAccept: () => void;
  onReject: () => void;
}> = ({ isOpen, callerName, callType, onAccept, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="call-modal-overlay">
      <div className="incoming-call-modal">
        <div className="caller-info">
          <div className="avatar-large">
            <Image
              src={`${ImagePath}/icon/user.png`}
              alt={callerName}
              width={120}
              height={120}
              className="rounded-circle"
            />
          </div>
          <h3>{callerName}</h3>
          <p>Incoming {callType} call...</p>
        </div>

        <div className="call-actions">
          <button className="btn-reject" onClick={onReject}>
            <DynamicFeatherIcon iconName="PhoneOff" />
          </button>
          <button className="btn-accept" onClick={onAccept}>
            <DynamicFeatherIcon
              iconName={callType === "video" ? "Video" : "Phone"}
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        .call-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .incoming-call-modal {
          background: white;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          max-width: 300px;
          width: 90vw;
        }

        .caller-info h3 {
          margin: 15px 0 5px 0;
          font-weight: 600;
        }

        .caller-info p {
          margin: 0 0 30px 0;
          color: #666;
        }

        .call-actions {
          display: flex;
          justify-content: center;
          gap: 40px;
        }

        .btn-reject,
        .btn-accept {
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-reject {
          background: #dc3545;
        }

        .btn-reject:hover {
          background: #c82333;
        }

        .btn-accept {
          background: #28a745;
        }

        .btn-accept:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
};
