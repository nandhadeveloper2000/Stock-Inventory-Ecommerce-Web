"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brandsService, categoriesService } from "@/services/catalog.service";
import { categoryBrandsService } from "@/services/category-brands.service";
import type { Brand, CategoryBrand } from "@/types/catalog.types";

function BrandLogo({ url, name }: { url?: string; name?: string }) {
  if (!url) return <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-[10px]">{name?.[0] ?? "?"}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name ?? ""} className="h-7 w-7 rounded bg-white object-contain p-0.5" />;
}

export default function CategoryBrandsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<CategoryBrand | null>(null);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesService.list });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsService.list });
  const { data: rows = [] } = useQuery({
    queryKey: ["category-brands", filter],
    queryFn: () => categoryBrandsService.list(filter || undefined),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["category-brands"] });

  const remove = async (r: CategoryBrand) => {
    if (!window.confirm(`Remove ${r.categoryName} → ${r.brandName}?`)) return;
    try {
      await categoryBrandsService.remove(r.id);
      toast.success("Mapping removed");
      invalidate();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Category-Brand Mapping</h1>
          <p className="text-sm text-muted-foreground">
            Pick a category and select one or many brands — each selected brand creates a (category, brand) row.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter || "all"} onValueChange={(v) => setFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add mappings
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">S.No</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No mappings yet. Click “Add mappings”.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={String(r.id)} className="border-t">
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{r.categoryName ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BrandLogo url={r.brandLogoUrl} name={r.brandName} />
                    <span>{r.brandName ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button className="text-primary hover:underline" onClick={() => setEditRow(r)}>
                      Edit
                    </button>
                    <button className="text-destructive hover:underline" onClick={() => remove(r)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <AddMappingsDialog
          categories={categories}
          brands={brands}
          onClose={() => setAddOpen(false)}
          onSaved={invalidate}
        />
      )}
      {editRow && (
        <EditMappingDialog
          row={editRow}
          categories={categories}
          brands={brands}
          onClose={() => setEditRow(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}

function AddMappingsDialog({
  categories,
  brands,
  onClose,
  onSaved,
}: {
  categories: { id: CategoryBrand["categoryId"]; name: string }[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: existing = [] } = useQuery({
    queryKey: ["cb-existing", categoryId],
    queryFn: () => categoryBrandsService.list(categoryId),
    enabled: !!categoryId,
  });
  const existingIds = useMemo(() => new Set(existing.map((e) => String(e.brandId))), [existing]);

  const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const willCreate = [...selected].filter((id) => !existingIds.has(id)).length;

  const save = async () => {
    if (!categoryId) return toast.error("Select a category");
    const ids = [...selected];
    if (ids.length === 0) return toast.error("Select at least one brand");
    setSaving(true);
    try {
      const created = await categoryBrandsService.createBulk(categoryId, ids);
      toast.success(`Created ${created.length} mapping(s)`);
      onSaved();
      onClose();
    } catch {
      toast.error("Could not save mappings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add mappings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Brands (pick one or many)</Label>
              <div className="text-xs">
                <button className="text-primary hover:underline" onClick={() => setSelected(new Set(filtered.map((b) => String(b.id))))}>
                  Select all
                </button>
                <span className="mx-1 text-muted-foreground">·</span>
                <button className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            </div>
            <Input placeholder="Search brand…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="grid max-h-52 grid-cols-1 gap-1.5 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
              {filtered.length === 0 && <p className="col-span-2 py-4 text-center text-sm text-muted-foreground">No brands.</p>}
              {filtered.map((b) => {
                const id = String(b.id);
                const already = existingIds.has(id);
                return (
                  <label key={id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent">
                    <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} />
                    <BrandLogo url={b.logoUrl} name={b.name} />
                    <span className="truncate">{b.name}</span>
                    {already && <span className="ml-auto text-[10px] text-muted-foreground">mapped</span>}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selected.size}</span> · Will create:{" "}
              <span className="font-medium text-foreground">{willCreate}</span> new mappings
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !categoryId || selected.size === 0}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save mappings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditMappingDialog({
  row,
  categories,
  brands,
  onClose,
  onSaved,
}: {
  row: CategoryBrand;
  categories: { id: CategoryBrand["categoryId"]; name: string }[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(String(row.categoryId));
  const [brandId, setBrandId] = useState(String(row.brandId));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await categoryBrandsService.update(row.id, { categoryId, brandId });
      toast.success("Mapping updated");
      onSaved();
      onClose();
    } catch {
      toast.error("Could not update (maybe it already exists)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit mapping</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={String(b.id)} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
