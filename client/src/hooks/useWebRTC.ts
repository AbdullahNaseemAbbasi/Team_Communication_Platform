"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Peer from "simple-peer";
import { getSocket } from "@/lib/socket";

interface CallState {
  isInCall: boolean;
  isCalling: boolean;
  isReceiving: boolean;
  callId: string | null;
  callType: "voice" | "video" | null;
  remoteUserId: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
}

export function useWebRTC() {
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    isCalling: false,
    isReceiving: false,
    callId: null,
    callType: null,
    remoteUserId: null,
    isMuted: false,
    isCameraOff: false,
  });

  const peerRef = useRef<Peer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const getMediaStream = useCallback(
    async (type: "voice" | "video"): Promise<MediaStream> => {
      return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
    },
    [],
  );

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setCallState({
      isInCall: false,
      isCalling: false,
      isReceiving: false,
      callId: null,
      callType: null,
      remoteUserId: null,
      isMuted: false,
      isCameraOff: false,
    });
  }, []);

  const initiateCall = useCallback(
    async (targetUserId: string, type: "voice" | "video") => {
      const socket = getSocket();
      const stream = await getMediaStream(type);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCallState((prev) => ({
        ...prev,
        isCalling: true,
        callType: type,
        remoteUserId: targetUserId,
      }));

      socket.emit("call:initiate", { targetUserId, type });
    },
    [getMediaStream],
  );

  const acceptCall = useCallback(
    async (callId: string, callType: "voice" | "video") => {
      const socket = getSocket();
      const stream = await getMediaStream(callType);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("call:signal", {
          callId,
          targetUserId: callState.remoteUserId,
          signal,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on("close", cleanup);
      peer.on("error", cleanup);

      peerRef.current = peer;

      setCallState((prev) => ({
        ...prev,
        isInCall: true,
        isReceiving: false,
        callId,
      }));

      socket.emit("call:accept", { callId });
    },
    [callState.remoteUserId, getMediaStream, cleanup],
  );

  const rejectCall = useCallback(
    (callId: string) => {
      const socket = getSocket();
      socket.emit("call:reject", { callId });
      cleanup();
    },
    [cleanup],
  );

  const endCall = useCallback(() => {
    const socket = getSocket();
    if (callState.callId) {
      socket.emit("call:end", { callId: callState.callId });
    }
    cleanup();
  }, [callState.callId, cleanup]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState((prev) => ({ ...prev, isCameraOff: !videoTrack.enabled }));
      }
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("call:initiated", (data: { callId: string }) => {
      setCallState((prev) => ({ ...prev, callId: data.callId }));
    });

    socket.on(
      "call:incoming",
      (data: { callId: string; callerId: string; type: "voice" | "video" }) => {
        setCallState((prev) => ({
          ...prev,
          isReceiving: true,
          callId: data.callId,
          callType: data.type,
          remoteUserId: data.callerId,
        }));
      },
    );

    socket.on(
      "call:accepted",
      (data: { callId: string; acceptedBy: string }) => {
        const stream = localStreamRef.current;
        if (!stream) return;

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream,
        });

        peer.on("signal", (signal) => {
          socket.emit("call:signal", {
            callId: data.callId,
            targetUserId: data.acceptedBy,
            signal,
          });
        });

        peer.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        peer.on("close", cleanup);
        peer.on("error", cleanup);

        peerRef.current = peer;

        setCallState((prev) => ({
          ...prev,
          isInCall: true,
          isCalling: false,
        }));
      },
    );

    socket.on("call:rejected", () => {
      cleanup();
    });

    socket.on("call:ended", () => {
      cleanup();
    });

    socket.on(
      "call:signal",
      (data: { callId: string; fromUserId: string; signal: any }) => {
        if (peerRef.current) {
          peerRef.current.signal(data.signal);
        }
      },
    );

    return () => {
      socket.off("call:initiated");
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:signal");
    };
  }, [cleanup]);

  return {
    callState,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
