"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Funnel, SortAsc, LayoutGrid } from "lucide-react";

export default function MediaDialog({
  open,
  onOpenChange,
  mediaList,
  loading,
  fetchMedia,
  triggerFileUpload,
  onSelect,
  selectedUrl,
}: any) {
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) fetchMedia();
      }}
    >
      <DialogContent className=" w-[55vw] max-w-[55vw] !sm:max-w-[55vw] !max-w-[55vw] max-h-[85vh] overflow-hidden  mt-[1vh] mb-[1vh] rounded-xl p-0 ">
        <div className="flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>Select file</DialogTitle>
          </DialogHeader>

          <div className="px-6 flex items-center gap-3 pb-4">
            <Input placeholder="Search files" className="flex-1" />

            <Button variant="outline" size="sm">
              <Funnel className="h-4 w-4 mr-1" /> Filters
            </Button>

            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-1" /> Sort
            </Button>

            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-6 pb-4">
            <div className="border border-dashed rounded-lg py-6 flex flex-col items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileUpload();
                }}
              >
                Add media
              </Button>
              <p className="text-xs text-gray-500 mt-2">Drag and drop images</p>
            </div>
          </div>

          <div className="px-6 pb-6 overflow-y-auto max-h-[45vh] no-scrollbar">
            {loading ? (
              <p className="text-center py-10 text-gray-500">Loading...</p>
            ) : (
              <div className="grid grid-cols-6 gap-5 mt-5">
                {mediaList.map((item: any) => {
                  const active = selectedUrl === item.url;

                  return (
                    <div
                      key={item.slug}
                      className={`border rounded-lg p-2 cursor-pointer transition relative ${
                        active
                          ? "ring-2 ring-primary"
                          : "hover:ring-2 hover:ring-primary"
                      }`}
                      onClick={() => {
                        onSelect({
                          id: item.slug,
                          url: item.url,
                          filename: item.filename,
                        });
                        onOpenChange(false);
                      }}
                    >
                      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.url}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-xs text-center mt-2 text-gray-600 truncate">
                        {item.filename}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
