"use client";

import * as React from "react";
import { startTransition } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";

export function SelectCategory({
  onSelect,
  resetSignal,
  defaultValue,
}: {
  onSelect: (id: number) => void;
  resetSignal?: number;
  defaultValue?: number; // ⭐ Added
}) {
  const { categories, loading } = useCategories();

  const [open, setOpen] = React.useState(false);
  const [path, setPath] = React.useState<any[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<any[]>([]);
  const [currentList, setCurrentList] = React.useState<any[]>([]);
  const [value, setValue] = React.useState("");

  /* ---------------------------------------------
     Load initial category tree
  --------------------------------------------- */
  React.useEffect(() => {
    if (!loading && categories.length > 0) {
      setCurrentList(categories);
    }
  }, [loading, categories]);

  /* ---------------------------------------------
     ⭐ AUTO-SELECT DEFAULT CATEGORY ON EDIT
  --------------------------------------------- */
  React.useEffect(() => {
    if (!defaultValue || loading || categories.length === 0) return;

    const findPath = (cats: any[], id: number, chain: any[] = []): any[] | null => {
      for (const c of cats) {
        if (c.id === id) return [...chain, c];
        if (c.children?.length) {
          const res = findPath(c.children, id, [...chain, c]);
          if (res) return res;
        }
      }
      return null;
    };

    const fullChain = findPath(categories, defaultValue);

    if (fullChain) {
      setSelectedPath(fullChain);
      setPath(fullChain.slice(0, -1)); // drilldown until parent
      setCurrentList(fullChain.at(-1)?.children ?? []);
      setValue(fullChain.map((c) => c.name).join(" > "));

      // notify parent
      startTransition(() => onSelect(defaultValue));
    }
  }, [defaultValue, categories, loading]);

  /* ---------------------------------------------
     Reset from parent
  --------------------------------------------- */
  React.useEffect(() => {
    if (!resetSignal) return;

    setValue("");
    setSelectedPath([]);
    setPath([]);
    setCurrentList(categories);
    setOpen(false);
  }, [resetSignal, categories]);

  /* ---------------------------------------------
     Helpers
  --------------------------------------------- */
  const getListFromPath = (pathArr: any[]) => {
    let list = categories;

    for (const node of pathArr) {
      const found = list.find((c) => c.id === node.id);
      if (!found) return categories;
      list = found.children ?? [];
    }

    return list;
  };

  /* ---------------------------------------------
     Select Category
  --------------------------------------------- */
  const selectCategory = (category: any) => {
    const parentPath = selectedPath.slice(0, path.length);
    const fullPath = [...parentPath, category];

    setSelectedPath(fullPath);
    setValue(fullPath.map((p) => p.name).join(" > "));

    startTransition(() => onSelect(category.id));

    if (category.children?.length > 0) {
      setPath(fullPath);
      setCurrentList(category.children);
      return;
    }

    setOpen(false);
  };

  const drillDown = (category: any) => {
    const newPath = [...path, category];
    setPath(newPath);
    setCurrentList(category.children ?? []);
  };

  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    setCurrentList(getListFromPath(newPath));
  };

  const handleOpen = (state: boolean) => {
    setOpen(state);
    if (!state) return;

    if (selectedPath.length > 0) {
      setPath(selectedPath.slice(0, -1));
      setCurrentList(getListFromPath(selectedPath.slice(0, -1)));
    }
  };

  /* ---------------------------------------------
     RENDER
  --------------------------------------------- */

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="w-full max-w-2xl space-y-2">
      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <div className="w-full relative">
            <Input
              value={value}
              readOnly
              onClick={() => handleOpen(true)}
              placeholder="Choose category"
              className="shadow-none border border-black cursor-pointer pr-10"
            />

            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setValue("");
                  setSelectedPath([]);
                  setPath([]);
                  setCurrentList(categories);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandGroup>
                {path.length > 0 && (
                  <div className="flex items-center px-3 py-2 border-b bg-muted/40 text-sm">
                    <button onClick={goBack} className="mr-2">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-medium">
                      {path.map((p) => p.name).join(" > ")}
                    </span>
                  </div>
                )}

                {currentList.map((category: any) => {
                  const level = path.length;
                  const isSelected =
                    selectedPath[selectedPath.length - 1]?.id === category.id;
                  const hasChildren = category.children?.length > 0;

                  return (
                    <CommandItem
                      key={category.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCategory(category);
                        }}
                      >
                        {category.name}
                      </div>

                      {hasChildren ? (
                        <ChevronRight
                          className="h-4 w-4 opacity-60 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            drillDown(category);
                          }}
                        />
                      ) : isSelected ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
