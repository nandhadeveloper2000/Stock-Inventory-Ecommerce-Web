"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  brandsService,
  modelsService,
  productTypesService,
  productCompatibilitiesService,
} from "@/services/catalog.service";
import type { ProductCompatibility, ProductModel } from "@/types/catalog.types";

interface EntryState {
  brandId: string;
  modelIds: string[];
  notes: string;
}

interface Props {
  record: ProductCompatibility | null;
  onSaved: () => void;
  close: () => void;
}

export function CompatibilityForm({ record, onSaved, close }: Props) {
  const { data: productTypes = [] } = useQuery({ queryKey: ["product-types"], queryFn: productTypesService.list });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsService.list });
  const { data: models = [] } = useQuery({ queryKey: ["models"], queryFn: modelsService.list });

  const [productTypeId, setProductTypeId] = useState<string>(
    record?.productTypeId != null ? String(record.productTypeId) : ""
  );
  const [productBrandId, setProductBrandId] = useState<string>(
    record?.productBrandId != null ? String(record.productBrandId) : ""
  );
  const [entries, setEntries] = useState<EntryState[]>(
    record?.compatible?.map((e) => ({
      brandId: e.brandId != null ? String(e.brandId) : "",
      modelIds: (e.models ?? []).map((m) => String(m.id)),
      notes: e.notes ?? "",
    })) ?? []
  );
  const [active, setActive] = useState<boolean>(record?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  // Default the top selects to the first option once the lists load.
  const ptValue = productTypeId || (productTypes[0]?.id != null ? String(productTypes[0].id) : "");
  const pbValue = productBrandId || (brands[0]?.id != null ? String(brands[0].id) : "");

  const modelsByBrand = useMemo(() => {
    const map = new Map<string, ProductModel[]>();
    for (const m of models) {
      const key = String(m.brandId);
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }
    return map;
  }, [models]);

  const addEntry = () => setEntries((prev) => [...prev, { brandId: "", modelIds: [], notes: "" }]);
  const removeEntry = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i));
  const updateEntry = (i: number, patch: Partial<EntryState>) =>
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const toggleModel = (i: number, modelId: string) =>
    setEntries((prev) =>
      prev.map((e, idx) => {
        if (idx !== i) return e;
        const has = e.modelIds.includes(modelId);
        return { ...e, modelIds: has ? e.modelIds.filter((m) => m !== modelId) : [...e.modelIds, modelId] };
      })
    );

  const handleSave = async () => {
    if (!ptValue) return toast.error("Select a product type");
    if (!pbValue) return toast.error("Select a product brand");
    const cleanEntries = entries.filter((e) => e.brandId);
    if (cleanEntries.length === 0) return toast.error("Add at least one compatible brand");

    const payload: Partial<ProductCompatibility> = {
      productTypeId: ptValue,
      productBrandId: pbValue,
      compatible: cleanEntries.map((e, i) => ({
        brandId: e.brandId,
        modelIds: e.modelIds,
        notes: e.notes || undefined,
        active: true,
        sortOrder: i,
      })),
      active,
    };

    try {
      setSaving(true);
      if (record) await productCompatibilitiesService.update(record.id, payload);
      else await productCompatibilitiesService.create(payload);
      toast.success("Saved successfully");
      onSaved();
      close();
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Product Brand</Label>
          <Select value={pbValue} onValueChange={setProductBrandId}>
            <SelectTrigger>
              <SelectValue placeholder="Select product brand" />
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
        <div className="space-y-1.5">
          <Label>Product Type</Label>
          <Select value={ptValue} onValueChange={setProductTypeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((pt) => (
                <SelectItem key={String(pt.id)} value={String(pt.id)}>
                  {pt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Compatible Brands &amp; Models</Label>
          <Button type="button" size="sm" variant="outline" onClick={addEntry}>
            <Plus className="mr-1 h-4 w-4" /> Add Brand
          </Button>
        </div>

        {entries.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No compatible brands yet. Click &ldquo;Add Brand&rdquo;.
          </p>
        )}

        {entries.map((entry, i) => {
          const brandModels = entry.brandId ? modelsByBrand.get(entry.brandId) ?? [] : [];
          return (
            <div key={i} className="space-y-3 rounded-md border p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Brand</Label>
                  <Select
                    value={entry.brandId}
                    onValueChange={(v) => updateEntry(i, { brandId: v, modelIds: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
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
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeEntry(i)}
                  aria-label="Remove brand"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  Models {entry.modelIds.length > 0 && `(${entry.modelIds.length} selected)`}
                </Label>
                {!entry.brandId ? (
                  <p className="text-xs text-muted-foreground">Select a brand to choose its models.</p>
                ) : brandModels.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No models found for this brand.</p>
                ) : (
                  <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto rounded-md border p-2">
                    {brandModels.map((m) => {
                      const mid = String(m.id);
                      return (
                        <label key={mid} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox
                            checked={entry.modelIds.includes(mid)}
                            onCheckedChange={() => toggleModel(i, mid)}
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input
                  value={entry.notes}
                  onChange={(e) => updateEntry(i, { notes: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="compat-active" checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
        <Label htmlFor="compat-active">Active</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
        </Button>
      </div>
    </div>
  );
}
