"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  callType: "voice" | "video";
  isMuted: boolean;
  isCameraOff: boolean;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

export default function CallScreen({
  callType,
  isMuted,
  isCameraOff,
  localVideoRef,
  remoteVideoRef,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex-1 flex items-center justify-center relative">
        {callType === "video" ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
            />
          </>
        ) : (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">📞</div>
            <p className="text-xl font-semibold">Voice call in progress</p>
            <audio ref={remoteVideoRef as any} autoPlay />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-6 bg-slate-900">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={onToggleMute}
        >
          {isMuted ? "🔇" : "🎤"}
        </Button>

        {callType === "video" && (
          <Button
            variant={isCameraOff ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={onToggleCamera}
          >
            {isCameraOff ? "📷" : "🎥"}
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={onEndCall}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
