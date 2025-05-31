
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "@/hooks/useSocket";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { formatTime } from "@/utils/index";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import Image from "next/image";

interface CallHandlerProps {
  user: any;
  onCallEnd: () => void;
  callType: "video" | "audio";
  isIncoming?: boolean;
  callerId?: string;
}

const CallHandler = ({ user, onCallEnd, callType, isIncoming = false, callerId }: CallHandlerProps) => {
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">(isIncoming ? "calling" : "calling");
  const [callDuration, setCallDuration] = useState<number>(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, sendMessage } = useSocket(() => {});

  useEffect(() => {
    if (callStatus === "connected" && !timerRef.current) {
      setCallStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callStatus]);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        setPeerConnection(pc);

        const mediaConstraints = {
          video: callType === "video",
          audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        setLocalStream(stream);

        if (localVideoRef.current && callType === "video") {
          localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteStream(event.streams[0]);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setCallStatus("connected");
          } else if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "closed") {
            handleEndCall();
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.emit("call_ice_candidate", {
              receiver_id: user.other_user.id,
              candidate: event.candidate,
            });
          }
        };

        if (!isIncoming) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket?.emit("call_offer", {
            receiver_id: user.other_user.id,
            offer: offer,
            call_type: callType,
          });
        }

      } catch (error) {
        console.error("Error initializing call:", error);
        handleEndCall();
      }
    };

    initializeCall();

    if (socket) {
      const handleCallAnswer = async (data: any) => {
        try {
          if (peerConnection && data.answer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } catch (error) {
          console.error("Error handling call answer:", error);
        }
      };

      const handleIceCandidate = async (data: any) => {
        try {
          if (peerConnection && data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (error) {
          console.error("Error handling ICE candidate:", error);
        }
      };

      const handleCallEnd = () => {
        handleEndCall();
      };

      socket.on("call_answer", handleCallAnswer);
      socket.on("call_ice_candidate", handleIceCandidate);
      socket.on("call_end", handleCallEnd);

      if (isIncoming && callerId) {
        socket.once("call_offer_details", async (data: any) => {
          try {
            if (peerConnection && data.offer) {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);

              socket.emit("call_answer", {
                receiver_id: callerId,
                answer: answer,
              });
            }
          } catch (error) {
            console.error("Error handling incoming call offer:", error);
          }
        });

        socket.emit("get_call_offer", { caller_id: callerId });
      }

      return () => {
        socket.off("call_answer", handleCallAnswer);
        socket.off("call_ice_candidate", handleIceCandidate);
        socket.off("call_end", handleCallEnd);
      };
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [socket, user, callType, isIncoming, callerId]);

  const handleEndCall = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      if (peerConnection) {
        peerConnection.close();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setCallStatus("ended");


      socket?.emit("call_end", {
        receiver_id: user.other_user.id,
      });

      sendMessage({
        content: `Cuộc gọi đã kết thúc}`,
        receiver_id: user.other_user.id,
        conversation_id: user.id,
        type: "text"
      });

      onCallEnd();
    } catch (error) {
      console.error("Error ending call:", error);
      onCallEnd();
    }
  };

  const formatCallDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream && callType === "video") {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <div className="call-container">
      <div className="call-header">
        <div className="user-info">
          <h4>{user.other_user.name}</h4>
          <p>
            {callStatus === "calling" ? "Calling..." : 
             callStatus === "connected" ? formatCallDuration(callDuration) : "Call ended"}
          </p>
        </div>
      </div>

      <div className={`call-content ${callType === "video" ? "video-call" : "audio-call"}`}>
        {callType === "video" ? (
          <>
            <div className="remote-video-container">
              {remoteStream || callStatus === "connected" ? (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="remote-video" 
                />
              ) : (
                <div className="awaiting-connection">
                  <div className="user-avatar">
                    <Image
                      src={user.other_user?.avatar || "/images/icon/user.png"}
                      width={120}
                      height={120}
                      alt={user.other_user.name}
                      className="rounded-circle"
                    />
                  </div>
                  <p>{callStatus === "calling" ? "Calling..." : "Connecting..."}</p>
                </div>
              )}
            </div>
            <div className="local-video-container">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="local-video" 
              />
            </div>
          </>
        ) : (
          <div className="audio-call-container">
            <div className="user-avatar">
              <Image
                src={user.other_user?.avatar || "/images/icon/user.png"}
                width={150}
                height={150}
                alt={user.other_user.name}
                className="rounded-circle"
              />
            </div>
            <h3>{user.other_user.name}</h3>
            <p className="call-status">
              {callStatus === "calling" ? "Calling..." : formatCallDuration(callDuration)}
            </p>
          </div>
        )}
      </div>

      <div className="call-actions">
        <button 
          onClick={toggleMute} 
          className={`action-button ${isMuted ? "active" : ""}`}
        >
          <DynamicFeatherIcon iconName={isMuted ? "MicOff" : "Mic"} className="icon-light" />
        </button>
        
        {callType === "video" && (
          <button 
            onClick={toggleCamera} 
            className={`action-button ${isCameraOff ? "active" : ""}`}
          >
            <DynamicFeatherIcon iconName={isCameraOff ? "VideoOff" : "Video"} className="icon-light" />
          </button>
        )}
        
        <button onClick={handleEndCall} className="end-call-button">
          <DynamicFeatherIcon iconName="PhoneOff" className="icon-light" />
        </button>
      </div>
    </div>
  );
};

export default CallHandler;