"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { Message } from "@/types";
import MessageItem from "./MessageItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  parentMessageId: string;
  channelId: string;
  onClose: () => void;
  onSendReply: (data: { 
    channelId: string; 
    content: string; 
    parentMessageId: string; 
  }) => void; 
  onReaction: (messageId: string,  emoji: string) => void; 
} 

export default function ThreadPanel({
  parentMessageId,
  channelId,
  onClose,
  onSendReply,
  onReaction,
}: Props) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get<Message[]>(
          `/messages/${parentMessageId}/thread`,
        );
        setReplies(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReplies();
  }, [parentMessageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    onSendReply({
      channelId,
      content: replyContent.trim(),
      parentMessageId,
    });
    setReplyContent("");
  };

  return (
    <div className="w-80 border-l flex flex-col bg-white dark:bg-slate-950">
      <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <h3 className="font-semibold text-sm">Thread</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 text-xs"
        >
          Close
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              Loading...
            </p>
          ) : (
            replies.map((reply) => (
              <MessageItem
                key={reply._id}
                message={reply}
                onEdit={() => {}}
                onDelete={() => {}}
                onReaction={onReaction}
                onThreadOpen={() => {}}
              />
            ))
          )}

          {!isLoading && replies.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No replies yet
            </p>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Reply..."
            className="flex-1 px-3 py-1.5 text-sm border rounded bg-white dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" size="sm" disabled={!replyContent.trim()}>
            Reply
          </Button>
        </div>
      </form>
    </div>
  );
}
