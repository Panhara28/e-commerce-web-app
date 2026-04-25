"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  FolderPlus, 
  MoreVertical, 
  Pencil, 
  Plus, 
  Search, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Layers
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
  children: Category[];
};

type CategoryResponse = {
  success: boolean;
  data: Category[];
};

export default function CategoryListScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "0" });
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const next = new Set(expandedItems);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedItems(next);
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/categories/nested-tree", { cache: "no-store" });
      const json = (await res.json()) as CategoryResponse;

      if (!res.ok || !json.success) {
        throw new Error("Failed to load categories");
      }

      setCategories(json.data);
      
      // Create a flat list for parent selection
      const flat: { id: number; name: string }[] = [];
      const flatten = (items: Category[], depth = 0) => {
        items.forEach(item => {
          flat.push({ id: item.id, name: `${"  ".repeat(depth)}${item.name}` });
          if (item.children && item.children.length > 0) {
            flatten(item.children, depth + 1);
          }
        });
      };
      flatten(json.data);
      setFlatCategories(flat);

    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = () => {
    setCurrentCategory(null);
    setFormData({ name: "", parentId: "0" });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({ 
      name: category.name, 
      parentId: category.parentId ? String(category.parentId) : "0" 
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      const isEditing = !!currentCategory;
      const url = isEditing 
        ? `/api/categories/${currentCategory.slug}/update` 
        : "/api/categories/create";
      
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId === "0" ? null : Number(formData.parentId),
        }),
      });

      if (!res.ok) throw new Error("Operation failed");

      setIsDialogOpen(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      setError("Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentCategory) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${currentCategory.slug}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete");
      }

      setIsDeleteDialogOpen(false);
      loadCategories();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryRow = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedItems.has(category.id);
    
    // Simple filter for search
    if (search && !category.name.toLowerCase().includes(search.toLowerCase())) {
        // If it doesn't match, check if any of its children match
        const anyChildMatches = (items: Category[]): boolean => {
            return items.some(item => 
                item.name.toLowerCase().includes(search.toLowerCase()) || 
                anyChildMatches(item.children)
            );
        };
        if (!anyChildMatches(category.children)) return null;
    }

    return (
      <div key={category.id}>
        <div className="flex items-center justify-between py-2 px-4 hover:bg-muted/50 rounded-lg group">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button onClick={() => toggleExpand(category.id)} className="text-muted-foreground hover:text-foreground">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="w-4" />
            )}
            <span className="font-medium">{category.name}</span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(category)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-0">
            {category.children.map(child => renderCategoryRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Product Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product hierarchy and organization.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={18} />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Total Categories" value={String(flatCategories.length)} icon={<Layers size={20} />} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category Tree</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error ? <div className="mb-4 text-sm text-destructive">{error}</div> : null}
          
          <div className="space-y-1">
            {loading && categories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No categories found. Start by adding one.</div>
            ) : (
              categories.map(cat => renderCategoryRow(cat))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{currentCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              <DialogDescription>
                Categories help you organize products for customers to find.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Football Shoes"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Category</label>
                <Select 
                  value={formData.parentId} 
                  onValueChange={val => setFormData({ ...formData, parentId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Parent (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (Root Category)</SelectItem>
                    {flatCategories
                      .filter(c => !currentCategory || c.id !== currentCategory.id)
                      .map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {currentCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentCategory?.name}"? This action cannot be undone.
              {currentCategory?.children && currentCategory.children.length > 0 && (
                <div className="mt-2 text-destructive font-bold">
                  Note: This category has sub-categories. You must delete or move them first.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
                variant="destructive" 
                onClick={confirmDelete} 
                disabled={loading || (currentCategory?.children && currentCategory.children.length > 0)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
