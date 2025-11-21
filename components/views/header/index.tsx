"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import {
  ChevronDown,
  Search,
  ShoppingCart,
  User,
  Trash2,
} from "lucide-react";

type Category = {
  id: number;
  slug: string;
  name: string;
  parent: any;
  children: Category[];
};

type CartItemType = {
  id: number;
  title: string;
  price: number;
  qty: number;
  image: string;
};

export default function ViewHeader() {
    const [cartItems, setCartItems] = useState<CartItemType[]>([
  {
    id: 1,
    title: "Nike Air Zoom Pegasus 40",
    price: 79.99,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1606813907291-3abdb1aa5020?w=800&q=80",
  },
  {
    id: 2,
    title: "Adidas Running Shorts",
    price: 24.5,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  },
  {
    id: 3,
    title: "Puma Training Gloves",
    price: 14.99,
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1598970434795-0c54fe7c0641?w=800&q=80",
  },
]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [openCategory, setOpenCategory] = useState(false);
  const [openChildId, setOpenChildId] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function openMenu() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenCategory(true);
  }
  function closeMenu() {
    timeoutRef.current = setTimeout(() => {
      setOpenCategory(false);
      setOpenChildId(null);
    }, 120);
  }

  function openChild(id: number) {
    if (childTimeoutRef.current) clearTimeout(childTimeoutRef.current);
    setOpenChildId(id);
  }
  function closeChild() {
    childTimeoutRef.current = setTimeout(() => {
      setOpenChildId(null);
    }, 120);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/views/categories/tree");
        const json = await res.json();
        setCategories(json.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    load();
  }, []);

  // ⭐ Remove cart item
  function removeItem(id: number) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <>
      <header className="bg-white border-b border-border relative z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl">
            <span>Tsportcambodia</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl relative">
            <Input
              placeholder="What are you looking..."
              className="w-full pl-4 pr-12 py-2 bg-muted text-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6">

            {/* ⭐ SHOPPING CART SHEET (RIGHT SIDE) */}
            <Sheet>
              <SheetTrigger asChild>
                <div className="relative cursor-pointer">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </div>
              </SheetTrigger>

              <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">

                <SheetHeader className="border-b p-4">
                  <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>

                {/* EMPTY CART */}
                {cartItems.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Your cart is empty.</p>
                  </div>
                )}

                {/* CART ITEMS */}
                {cartItems.length > 0 && (
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border rounded-lg p-3"
                      >
                        <div className="w-16 h-16 relative rounded overflow-hidden border">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.qty} × ${item.price}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* FOOTER */}
                {cartItems.length > 0 && (
                  <SheetFooter className="border-t p-4">
                    <div className="flex justify-between font-medium mb-3">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <Link
                      href="/views/checkout"
                      className="bg-emerald-600 text-white text-center py-3 rounded-md hover:bg-emerald-700 transition block"
                    >
                      Checkout
                    </Link>

                    <SheetClose className="text-center text-muted-foreground mt-2">
                      Continue Shopping
                    </SheetClose>
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>

            {/* SIGN IN */}
            <Link
              href="/views/signin"
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Sign In</span>
            </Link>

          </div>
        </div>

        {/* NAVIGATION */}
        <div className="bg-white border-t border-border">
          <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-8 relative">

            <nav className="flex items-center gap-6 text-sm flex-1">

              <Link href="/" className="hover:text-emerald-600 transition">
                Home
              </Link>

              {/* CATEGORY DROPDOWN (unchanged) */}
              <div
                className="relative"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
              >
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  Categories <ChevronDown className="w-4 h-4" />
                </button>

                {openCategory && (
                  <div
                    className="absolute top-full left-0 w-[300px] bg-white border border-border shadow-lg rounded-md mt-2 p-3"
                    onMouseEnter={openMenu}
                    onMouseLeave={closeMenu}
                  >
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="relative"
                        onMouseEnter={() => openChild(cat.id)}
                        onMouseLeave={closeChild}
                      >
                        <div className="flex justify-between items-center py-2 px-2 rounded hover:bg-muted/50 transition cursor-pointer">
                          <Link href={`/views/categories/${cat.slug}`}>
                            {cat.name}
                          </Link>

                          {cat.children.length > 0 && (
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                          )}
                        </div>

                        {cat.children.length > 0 && openChildId === cat.id && (
                          <div
                            className="absolute left-full top-0 w-[250px] bg-white border border-border shadow-lg rounded-md ml-1 p-2"
                            onMouseEnter={() => openChild(cat.id)}
                            onMouseLeave={closeChild}
                          >
                            {cat.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/views/categories/${child.slug}`}
                                className="block py-2 px-2 rounded hover:bg-muted/50 transition"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/views/products" className="hover:text-emerald-600 transition">
                Products
              </Link>

              <Link href="/views/search" className="hover:text-emerald-600 transition">
                Search
              </Link>

              <Link href="/views/about-us" className="hover:text-emerald-600 transition">
                About Us
              </Link>

              <Link href="/views/contact-us" className="hover:text-emerald-600 transition">
                Contact Us
              </Link>

            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
