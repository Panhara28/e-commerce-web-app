"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function MediaUpload() {
  const [openDialog, setOpenDialog] = useState<null | "upload" | "select">(
    null
  );

  const handleUploadNew = () => setOpenDialog("upload");
  const handleSelectExisting = () => setOpenDialog("select");
  const closeDialog = () => setOpenDialog(null);

  return (
    <div className="border border-dashed border-black rounded-lg p-8 hover:bg-gray-100 cursor-pointer transition-colors">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="px-3 bg-transparent text-xs cursor-pointer"
          >
            Upload new
          </Button>
          <Button
            onClick={handleSelectExisting}
            variant="outline"
            className="px-3 bg-transparent text-xs border-none shadow-none cursor-pointer"
          >
            Select existing
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Accepts images, videos, or 3D models
        </p>
      </div>

      {/* Upload Dialog */}
      <Dialog open={openDialog === "upload"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload new media</DialogTitle>
            <DialogDescription>
              Choose files to upload for this product. Supported: JPG, PNG, MP4,
              GLB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Input type="file" multiple className="cursor-pointer" />
              <p className="text-xs text-muted-foreground mt-2">
                You can drag and drop files here or click to browse.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground hover:ring-2 hover:ring-primary transition"
                >
                  Preview {i + 1}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={() => alert("Uploading...")}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Existing Dialog */}
      <Dialog open={openDialog === "select"} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select existing media</DialogTitle>
            <DialogDescription>
              Choose from your previously uploaded media files.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-4 py-4">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-md flex items-center justify-center hover:ring-2 hover:ring-primary transition"
              >
                <span className="text-xs text-muted-foreground">
                  Image {i + 1}
                </span>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={() => alert("Media selected!")}>Select</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
