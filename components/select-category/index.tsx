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
  const [path, setPath] = React.useState<string[]>([]);
  const [currentList, setCurrentList] = React.useState<Category[]>(categories);

  const [value, setValue] = React.useState("");
  const [selectedPath, setSelectedPath] = React.useState<string[]>([]);

  const getCategoryListFromPath = (pathArray: string[]) => {
    let list = categories;
    for (const name of pathArray) {
      const found = list.find((c) => c.name === name);
      if (!found?.children) return list;
      list = found.children;
    }
    return list;
  };

  // ⭐ Select parent or leaf
  const selectCategory = (category: Category) => {
    const fullPath = [...path, category.name];

    setSelectedPath(fullPath);
    setValue(fullPath.join(" > "));

    if (category.children && category.children.length > 0) {
      // Parent selectable + show children
      setPath(fullPath);
      setCurrentList(category.children);
      return;
    }

    // Leaf → close popover
    setOpen(false);
  };

  // ⭐ Drill down only
  const drillDown = (category: Category) => {
    setPath((prev) => [...prev, category.name]);
    setCurrentList(category.children || []);
  };

  const goBack = () => {
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    setCurrentList(getCategoryListFromPath(newPath));
  };

  // ⭐ Restore active path on open
  const handleOpen = (state: boolean) => {
    setOpen(state);
    if (state && selectedPath.length > 0) {
      setPath(selectedPath.slice(0, -1));
      setCurrentList(getCategoryListFromPath(selectedPath.slice(0, -1)));
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-2">
      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <Input
              value={value}
              readOnly
              onClick={() => handleOpen(true)}
              placeholder="Choose category"
              className="shadow-none border border-black cursor-pointer"
            />
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

              <CommandEmpty>No category found.</CommandEmpty>

              <CommandGroup>
                {/* Breadcrumb */}
                {path.length > 0 && (
                  <div className="flex items-center px-3 py-2 border-b bg-muted/40 text-sm">
                    <button onClick={goBack} className="mr-2">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-medium">
                      {path.join(" > ")}
                    </span>
                  </div>
                )}

                {currentList.map((category) => {
                  const levelIndex = path.length; // current depth
                  const isActiveLevel =
                    selectedPath[levelIndex] === category.name;

                  const hasChildren =
                    category.children && category.children.length > 0;

                  const isFinalSelected =
                    selectedPath[selectedPath.length - 1] === category.name;

                  return (
                    <CommandItem
                      key={category.name}
                      className={`flex items-center justify-between cursor-pointer ${
                        isActiveLevel ? "bg-accent/50" : ""
                      }`}
                    >
                      {/* Select parent/leaf */}
                      <div
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectCategory(category);
                        }}
                      >
                        {category.name}
                      </div>

                      {/* Drill-down arrow OR check mark */}
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
