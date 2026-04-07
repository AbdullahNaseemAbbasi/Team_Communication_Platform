"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Analytics {
  totalMembers: number;
  onlineMembers: number;
  totalChannels: number;
  totalMessages: number;
  messagesPerDay: { _id: string; count: number }[];
  popularChannels: { name: string; type: string; messageCount: number }[];
}

interface StorageInfo {
  totalSize: number;
  fileCount: number;
  limit: number;
}

export default function AdminPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [analyticsRes, storageRes] = await Promise.all([
          api.get(`/admin/${workspaceId}/analytics`),
          api.get(`/admin/${workspaceId}/storage`),
        ]);
        setAnalytics(analyticsRes.data);
        setStorage(storageRes.data);
      } catch {
        setError("Failed to load admin data. You may not have admin access.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [workspaceId]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalMembers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Online Now</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.onlineMembers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Channels</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {analytics?.totalChannels || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {analytics?.totalMessages || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages Per Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.messagesPerDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {analytics?.messagesPerDay.map((day) => (
                  <div key={day._id} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24">
                      {day._id}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (day.count /
                              Math.max(
                                ...analytics.messagesPerDay.map((d) => d.count),
                              )) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Channels</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.popularChannels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics?.popularChannels.map((ch, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">
                      {ch.type === "private" ? "🔒" : "#"} {ch.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {ch.messageCount} messages
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {storage && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>
                  {formatBytes(storage.totalSize)} of{" "}
                  {formatBytes(storage.limit)} used
                </span>
                <span>{storage.fileCount} files</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (storage.totalSize / storage.limit) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
