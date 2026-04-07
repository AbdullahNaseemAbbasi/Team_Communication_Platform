"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [customStatus, setCustomStatus] = useState(user?.customStatus || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage("");

    try {
      const { data } = await api.patch("/users/me", {
        displayName,
        customStatus,
      });
      setUser(data);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data);
      setMessage("Avatar updated successfully");
    } catch {
      setMessage("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Click on the avatar to upload a new image</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-20 w-20">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.displayName} />}
              <AvatarFallback className="text-xl bg-slate-200 dark:bg-slate-700">
                {user?.displayName ? getInitials(user.displayName) : "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Change Avatar"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or GIF. Max 10MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name and status</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {message && (
              <div
                className={`text-sm p-3 rounded-md ${
                  message.includes("success")
                    ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customStatus">Custom Status</Label>
              <Input
                id="customStatus"
                placeholder="What are you working on?"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                maxLength={100}
                disabled={isUpdating}
              />
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
