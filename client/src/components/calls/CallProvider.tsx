"use client";

import { useWebRTC } from "@/hooks/useWebRTC";
import CallNotification from "./CallNotification";
import CallScreen from "./CallScreen";

export default function CallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    callState,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useWebRTC();

  return (
    <>
      {children}

      {callState.isReceiving && callState.callId && callState.callType && (
        <CallNotification
          callType={callState.callType}
          callId={callState.callId}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {callState.isInCall && callState.callType && (
        <CallScreen
          callType={callState.callType}
          isMuted={callState.isMuted}
          isCameraOff={callState.isCameraOff}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onEndCall={endCall}
        />
      )}
    </>
  );
}
