"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
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
import { Input } from "../ui/input";

const categories = [
  "Animals & Pet Supplies",
  "Apparel & Accessories",
  "Arts & Entertainment",
  "Baby & Toddler",
  "Business & Industrial",
  "Cameras & Optics",
  "Electronics",
  "Food, Beverages & Tobacco",
  "Furniture",
  "Hardware",
  "Health & Personal Care",
  "Home & Garden",
  "Industrial & Scientific",
  "Jewelry",
  "Luggage",
  "Musical Instruments",
  "Office Products",
  "Outdoor Recreation",
  "Software",
  "Sporting Goods",
  "Tools & Home Improvement",
  "Toys & Games",
];

export function SelectCategory() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <div className="w-full max-w-2xl space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        {/* ⭐ WRAPPER DIV — becomes the trigger (NOT the Input itself) */}
        <PopoverTrigger asChild>
          <div className="w-full">
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setOpen(true);
              }}
              onClick={() => setOpen(true)}
              placeholder="Choose a product category"
              className="shadow-none border border-black"
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
                {categories
                  .filter((c) => c.toLowerCase().includes(value.toLowerCase()))
                  .map((c) => (
                    <CommandItem
                      key={c}
                      onSelect={() => {
                        setValue(c);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between cursor-pointer hover:bg-accent"
                    >
                      <span>{c}</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
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
