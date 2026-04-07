"use client";

import { Button } from "@/components/ui/button";

interface Props {
  callType: "voice" | "video";
  callId: string;
  onAccept: (callId: string, type: "voice" | "video") => void;
  onReject: (callId: string) => void;
}

export default function CallNotification({
  callType,
  callId,
  onAccept,
  onReject,
}: Props) {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-slate-900 border rounded-xl shadow-2xl p-6 w-80 animate-in slide-in-from-top">
      <div className="text-center">
        <div className="text-4xl mb-3">{callType === "video" ? "📹" : "📞"}</div>
        <h3 className="font-semibold text-lg">
          Incoming {callType} call
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Someone is calling you...
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onReject(callId)}
        >
          Decline
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => onAccept(callId, callType)}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
