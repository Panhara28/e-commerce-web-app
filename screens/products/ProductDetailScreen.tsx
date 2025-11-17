"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { Edit, Copy, Download, MoreVertical } from "lucide-react";

/* -----------------------------------------------------------
   Types
----------------------------------------------------------- */
interface ProductData {
  id: number;
  slug: string;
  title: string;
  description: any;
  productCode: string;
  status: string;
  price: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  Category: { id: number; name: string; slug: string };
  variants: Array<{
    id: number;
    slug: string;
    productId: number;
    size: string;
    color: string;
    material: string;
    price: number;
    stock: number;
    barcode: string;
  }>;
  media: Array<{
    id: number;
    filename: string;
    url: string;
    type: string;
    title: string;
    description: string;
  }>;
}

/* -----------------------------------------------------------
   Component
----------------------------------------------------------- */
export default function ProductDetailScreen() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -----------------------------------------------------------
     Fetch Product from API
  ----------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);

        if (!res.ok) {
          setError("Product not found");
          return;
        }

        const json = await res.json();
        setProduct(json.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (slug) load();
  }, [slug]);

  /* -----------------------------------------------------------
     Status Color Helper
  ----------------------------------------------------------- */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECOVERED":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
      case "PUBLISHED":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  /* -----------------------------------------------------------
     Loading / Error
  ----------------------------------------------------------- */
  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading product...
      </div>
    );

  if (error || !product)
    return (
      <div className="p-10 text-center text-destructive text-lg font-medium">
        {error}
      </div>
    );

  /* -----------------------------------------------------------
     Main UI (same layout you provided)
  ----------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {product.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Product Code:{" "}
                <span className="font-mono font-semibold">
                  {product.productCode}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(product.status)}>
                {product.status}
              </Badge>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-1">
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          {/* ---------------- DETAILS TAB ---------------- */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Product Image */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      {product.media[0]?.url ? (
                        <Image
                          src={product.media[0].url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Info */}
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Product Information
                      </CardTitle>
                      <CardDescription>
                        Basic details and categorization
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Title
                      </label>
                      <p className="mt-1 text-sm text-foreground font-medium">
                        {product.title}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <p className="mt-1 text-sm text-foreground">
                        {typeof product.description === "object"
                          ? product.description?.text
                          : product.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Category
                        </label>
                        <p className="mt-1 text-sm text-foreground font-medium">
                          {product.Category?.name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Product Code
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                            {product.productCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Product ID
                        </label>
                        <p className="mt-1 text-sm font-mono">{product.id}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Status
                        </label>
                        <p className="mt-1">
                          <Badge
                            variant="outline"
                            className={getStatusColor(product.status)}
                          >
                            {product.status}
                          </Badge>
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Created
                        </label>
                        <p className="mt-1 text-sm">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </label>
                        <p className="mt-1 text-sm">
                          {new Date(product.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ---------------- VARIANTS TAB ---------------- */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product Variants</CardTitle>
                  <CardDescription>
                    {product.variants.length} total variants
                  </CardDescription>
                </div>

                <Button size="sm">+ Add Variant</Button>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="w-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {product.variants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>{variant.size}</TableCell>
                        <TableCell>{variant.color}</TableCell>
                        <TableCell>{variant.material}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${variant.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              variant.stock > 5 ? "secondary" : "destructive"
                            }
                          >
                            {variant.stock} in stock
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- MEDIA TAB ---------------- */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Product Media</CardTitle>
                  <CardDescription>
                    {product.media.length} media files
                  </CardDescription>
                </div>
                <Button size="sm">+ Upload Media</Button>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {product.media.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-lg border border-border overflow-hidden bg-muted"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={item.url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/20"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-3">
                        <p className="text-xs font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- PRICING TAB ---------------- */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Pricing</CardTitle>
                  <CardDescription>
                    Base price and pricing rules
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      Base Price
                    </label>
                    <p className="mt-2 text-3xl font-bold">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Variants
                    </label>
                    <p className="mt-2 text-3xl font-bold">
                      {product.variants.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Variant Pricing</h3>

                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <span className="text-sm">
                          {variant.size} - {variant.color}
                        </span>
                        <span className="font-mono font-semibold">
                          ${variant.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
