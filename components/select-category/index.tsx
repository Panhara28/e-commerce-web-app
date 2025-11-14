"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
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

// =============================
// CATEGORY DATA (recursive)
// =============================
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
        children: [
          { name: "Dogs" },
          { name: "Cats" },
          { name: "Rabbits" },
        ],
      },
      {
        name: "Pet Supplies",
        children: [
          { name: "Pet Food" },
          { name: "Pet Toys" },
          { name: "Accessories" },
        ],
      },
    ],
  },
  {
    name: "Electronics",
    children: [
      {
        name: "Mobile Phones",
        children: [
          { name: "Smartphones" },
          { name: "Feature Phones" },
        ],
      },
      {
        name: "Computers",
        children: [
          { name: "Laptops" },
          { name: "Desktops" },
        ],
      },
    ],
  },
];

export function SelectCategory() {
  const [open, setOpen] = React.useState(false);

  // full selected path (breadcrumb)
  const [path, setPath] = React.useState<string[]>([]);

  // current category list shown in popover
  const [currentList, setCurrentList] =
    React.useState<Category[]>(categories);

  // input text
  const [value, setValue] = React.useState("");

  // when selecting a category
  const handleSelect = (category: Category) => {
    if (category.children && category.children.length > 0) {
      // go deeper
      setPath((prev) => [...prev, category.name]);
      setCurrentList(category.children);
    } else {
      // leaf reached → final
      const fullPath = [...path, category.name].join(" > ");
      setValue(fullPath);

      // close
      setOpen(false);

      // reset to root for next time
      setPath([]);
      setCurrentList(categories);
    }
  };

  // go back one level
  const goBack = () => {
    const newPath = [...path];
    newPath.pop();

    // find the new category list
    let list = categories;
    newPath.forEach((name) => {
      const found = list.find((c) => c.name === name);
      list = found?.children ?? [];
    });

    setPath(newPath);
    setCurrentList(list.length ? list : categories);
  };

  return (
    <div className="w-full max-w-2xl space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <Input
              value={value}
              onClick={() => setOpen(true)}
              placeholder="Choose a product category"
              readOnly
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
                {/* Breadcrumb Header */}
                {path.length > 0 && (
                  <div className="flex items-center px-3 py-2 border-b bg-muted/40 text-sm">
                    <button
                      onClick={goBack}
                      className="mr-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-medium">
                      {path.join(" > ")}
                    </span>
                  </div>
                )}

                {/* Current list of categories */}
                {currentList.map((c) => (
                  <CommandItem
                    key={c.name}
                    onSelect={() => handleSelect(c)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {c.name}

                    {c.children && c.children.length > 0 && (
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
