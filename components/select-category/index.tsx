"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
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

type Category = {
  name: string;
  children?: Category[];
};

const categories: Category[] = [
  {
    name: "Animals & Pet Supplies",
    children: [
      {
        name: "Live Animals",
        children: [{ name: "Dogs" }, { name: "Cats" }],
      },
      {
        name: "Pet Supplies",
        children: [{ name: "Pet Food" }, { name: "Pet Toys" }],
      },
    ],
  },
  {
    name: "Electronics",
    children: [
      {
        name: "Mobile Phones",
        children: [{ name: "Smartphones" }],
      },
    ],
  },
];

export function SelectCategory() {
  const [open, setOpen] = React.useState(false);

  // ► path = browser navigation ONLY
  const [path, setPath] = React.useState<string[]>([]);

  // ► selectedPath = FINAL chosen category
  const [selectedPath, setSelectedPath] = React.useState<string[]>([]);

  const [currentList, setCurrentList] = React.useState<Category[]>(categories);
  const [value, setValue] = React.useState("");

  const getListFromExactPath = (pathArray: string[]) => {
    let list = categories;
    for (const name of pathArray) {
      const found = list.find((c) => c.name === name);
      if (!found) return categories;
      list = found.children ?? [];
    }
    return list;
  };

  // ⭐ FIXED SELECT LOGIC
  const selectCategory = (category: Category) => {
    const fullPath = [...path, category.name]; // build from browsing path

    // Save final selection
    setSelectedPath(fullPath);
    setValue(fullPath.join(" > "));

    if (category.children && category.children.length > 0) {
      // Parent selected → browse deeper, DO NOT close
      setPath(fullPath);
      setCurrentList(category.children);
      return;
    }

    // Leaf selected → close
    setOpen(false);
  };

  const drillDown = (category: Category) => {
    const newPath = [...path, category.name];
    setPath(newPath);
    setCurrentList(category.children ?? []);
  };

  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    setCurrentList(getListFromExactPath(newPath));
  };

  const handleOpen = (state: boolean) => {
    setOpen(state);

    if (!state) return;

    if (selectedPath.length > 0) {
      // Restore browsing to selectedPath
      setPath(selectedPath);
      setCurrentList(getListFromExactPath(selectedPath));
    }
  };

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

            {/* X CLEAR ICON */}
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
                {/* Breadcrumb */}
                {path.length > 0 && (
                  <div className="flex items-center px-3 py-2 border-b bg-muted/40 text-sm">
                    <button onClick={goBack} className="mr-2">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{path.join(" > ")}</span>
                  </div>
                )}

                {/* LIST ITEMS */}
                {currentList.map((category) => {
                  const levelIndex = path.length;

                  const isActive =
                    path[levelIndex] === category.name ||
                    selectedPath[levelIndex] === category.name;

                  const isFinalSelected =
                    selectedPath[selectedPath.length - 1] === category.name;

                  const hasChildren =
                    category.children && category.children.length > 0;

                  return (
                    <CommandItem
                      key={category.name}
                      className={`flex items-center justify-between cursor-pointer ${
                        isActive ? "bg-accent/60" : ""
                      }`}
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
                      ) : isFinalSelected ? (
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
