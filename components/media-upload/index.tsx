"use client";

import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Search, SortAsc, LayoutGrid } from "lucide-react";
import MediaGallery from "./media-gallery";

type MediaItem = {
  id?: string;
  slug?: string;
  url: string;
  filename?: string;
  name?: string;
  size?: number;
  type?: string;
};

type UploadingMediaItem = MediaItem & {
  file?: File;
  isUploading?: boolean;
};

type MediaListResponse = {
  media?: MediaItem[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type MediaUploadProps = {
  value?: UploadingMediaItem[];
  onChange?: (files: UploadingMediaItem[]) => void;
};

export function MediaUpload({ value = [], onChange }: MediaUploadProps) {
  const [openDialog, setOpenDialog] = useState(false);

  // --- IMPORTANT: use parent's initial value ---
  const [files, setFiles] = useState<UploadingMediaItem[]>(value);

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerFileUpload = () => fileInputRef.current?.click();

  /* -------------------------------------------------------------------------- */
  /*                      SYNC FILES TO PARENT VARIANTS PAGE                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (onChange) onChange(files);
  }, [files, onChange]);

  useEffect(() => {
    setFiles(value || []);
  }, [value]);

  /* -------------------------------------------------------------------------- */
  /*                             UPLOAD LOCAL FILES                             */
  /* -------------------------------------------------------------------------- */
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const previews = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      isUploading: true,
    }));

    setFiles((prev) => [...prev, ...previews]);

    const form = new FormData();
    form.append("folder", "tsport_products");
    previews.forEach((p) => form.append("files", p.file));

    try {
      const res = await fetch("/api/multiple-upload", {
        method: "POST",
        body: form,
      });

      const raw = await res.text();
      let data: { uploads?: MediaItem[]; raw?: string } | null = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { raw };
      }

      if (!res.ok) {
        setFiles((prev) => prev.filter((f) => !previews.some((p) => p.id === f.id)));
        return console.error("upload failed", {
          status: res.status,
          statusText: res.statusText,
          data,
        });
      }

      // Normalize uploaded data
      const uploaded = (data?.uploads || []).map((u) => ({
        ...u,
        id: u.slug,
      }));

      // Replace preview with saved media
      setFiles((prev) => {
        const keep = prev.filter((f) => !f.isUploading);
        return [...keep, ...uploaded];
      });

      await fetchMedia();
    } catch (error) {
      setFiles((prev) => prev.filter((f) => !previews.some((p) => p.id === f.id)));
      console.error("upload request failed", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                        FETCH EXISTING MEDIA FOR MODAL                      */
  /* -------------------------------------------------------------------------- */
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        sort,
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/media/list?${params.toString()}`);
      const data = (await res.json()) as MediaListResponse;
      setMediaList(data.media || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => {
    if (!openDialog) return;
    fetchMedia();
  }, [fetchMedia, openDialog]);

  /* -------------------------------------------------------------------------- */
  /*                                REMOVE FROM UI                               */
  /* -------------------------------------------------------------------------- */
  const handleDelete = (identifier: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== identifier));
  };

  /* -------------------------------------------------------------------------- */
  /*                                  REORDER                                   */
  /* -------------------------------------------------------------------------- */
  const handleReorder = (newOrder: UploadingMediaItem[]) => {
    setFiles(newOrder);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Empty state */}
      {files.length === 0 && (
        <div className="border border-dashed border-black rounded-lg p-8 hover:bg-gray-100 cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="text-xs"
                onClick={triggerFileUpload}
              >
                Upload new
              </Button>

              <Button
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setOpenDialog(true);
                  fetchMedia();
                }}
              >
                Select existing
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Accepts images, videos, or 3D models
            </p>
          </div>
        </div>
      )}

      {/* Gallery */}
      {files.length > 0 && (
        <div className="mt-4">
          <MediaGallery
            files={files}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onOpenModal={() => {
              setOpenDialog(true);
              fetchMedia();
            }}
          />
        </div>
      )}

      {/* MODAL SELECTOR */}
      <Dialog
        open={openDialog}
        onOpenChange={(v) => {
          setOpenDialog(v);
          if (v) {
            setPage(1);
          }
        }}
      >
        <DialogContent className=" w-[55vw] max-w-[55vw] !sm:max-w-[55vw] !max-w-[55vw] max-h-[85vh] overflow-hidden /* <— IMPORTANT: no scroll here */ mt-[1vh] mb-[1vh] rounded-xl p-0 ">
          <div className="flex flex-col max-h-[85vh] overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-3">
              <DialogTitle>Select file</DialogTitle>
            </DialogHeader>

            <div className="px-6 flex items-center gap-3 pb-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files"
                  className="flex-1 pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      setSearch(searchInput);
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPage(1);
                  setSearch(searchInput);
                }}
              >
                Search
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-1" />
                <select
                  value={sort}
                  onChange={(e) => {
                    setPage(1);
                    setSort(e.target.value);
                  }}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </Button>
              <Button variant="outline" size="sm" disabled>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload inside modal */}
            <div className="px-6 pb-4">
              <div className="border border-dashed rounded-lg py-6 flex flex-col items-center">
                <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                  Add media
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Drag and drop images
                </p>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[45vh] no-scrollbar">
              {loading ? (
                <p className="text-center py-10 text-gray-500">Loading...</p>
              ) : mediaList.length ? (
                <div className="grid grid-cols-6 gap-5 mt-5">
                  {mediaList.map((item) => {
                    const selected = files.some((f) => f.id === item.slug);

                    return (
                      <div
                        key={item.slug}
                        className={`relative border rounded-lg p-2 cursor-pointer transition ${
                          selected
                            ? "ring-primary ring-2"
                            : "hover:ring-2 hover:ring-primary"
                        }`}
                        onClick={() => {
                          if (selected) {
                            setFiles((prev) =>
                              prev.filter((f) => f.id !== item.slug)
                            );
                          } else {
                            setFiles((prev) => [
                              ...prev,
                              { ...item, id: item.slug },
                            ]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selected}
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiles((prev) => [
                                ...prev,
                                { ...item, id: item.slug },
                              ]);
                            } else {
                              setFiles((prev) =>
                                prev.filter((f) => f.id !== item.slug)
                              );
                            }
                          }}
                        />

                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <Image
                            src={item.url}
                            alt={item.filename || item.name || "Media"}
                            width={320}
                            height={320}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="text-xs text-center mt-2 text-muted-foreground truncate">
                          {item.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-10 text-center text-gray-500">No media found.</p>
              )}
            </div>

            <DialogFooter className="px-6 pb-6">
              <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpenDialog(false)}>Done</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
