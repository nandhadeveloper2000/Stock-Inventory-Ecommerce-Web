"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CrudManagementPage, InfoRow } from "@/components/common/CrudManagementPage";
import { ModelForm } from "@/components/catalog/ModelForm";
import { brandsService, categoriesService, modelsService } from "@/services/catalog.service";
import type { ProductModel } from "@/types/catalog.types";

export default function ModelsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["models"], queryFn: modelsService.list });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: categoriesService.list });
  const { data: brands = [] } = useQuery({ queryKey: ["brands"], queryFn: brandsService.list });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["models"] });

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [String(c.id), c.name]));
    return (id?: ProductModel["categoryId"]) => (id != null ? map.get(String(id)) ?? "—" : "—");
  }, [categories]);

  const brandName = useMemo(() => {
    const map = new Map(brands.map((b) => [String(b.id), b.name]));
    return (r: ProductModel) => r.brandName ?? (r.brandId != null ? map.get(String(r.brandId)) : undefined) ?? "—";
  }, [brands]);

  return (
    <CrudManagementPage<ProductModel>
      title="Models"
      description="Select a category, pick a mapped brand, then add the model name and number."
      rows={data}
      searchKeys={["name", "brandName", "modelNumber"]}
      columns={[
        { key: "name", header: "Model", render: (r) => <span className="font-medium">{r.name}</span> },
        { key: "categoryId", header: "Category", render: (r) => categoryName(r.categoryId) },
        { key: "brandName", header: "Brand", render: (r) => brandName(r) },
        { key: "modelNumber", header: "Model Number" },
      ]}
      formTitle="Model"
      formContent={(record, close) => <ModelForm record={record} onSaved={invalidate} close={close} />}
      viewContent={(r) => (
        <>
          <InfoRow label="Name" value={r.name} />
          <InfoRow label="Category" value={categoryName(r.categoryId)} />
          <InfoRow label="Brand" value={brandName(r)} />
          <InfoRow label="Model Number" value={r.modelNumber} />
        </>
      )}
      onDelete={async (r) => {
        await modelsService.remove(r.id);
        invalidate();
      }}
      onToggleStatus={async (r) => {
        await modelsService.toggleStatus(r.id, !r.isActive);
        invalidate();
      }}
    />
  );
}
