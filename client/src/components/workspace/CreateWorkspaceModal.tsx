"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { createWorkspace, setActiveWorkspace } = useWorkspaceStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const workspace = await createWorkspace(name, description);
      await setActiveWorkspace(workspace);
      setName("");
      setDescription("");
      onClose();
    } catch {
      setError("Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>
            Workspaces are where your team communicates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace Name</Label>
            <Input
              id="ws-name"
              placeholder="e.g. My Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws-desc">Description (optional)</Label>
            <Input
              id="ws-desc"
              placeholder="What is this workspace about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
