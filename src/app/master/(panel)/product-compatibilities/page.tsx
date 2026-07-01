"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CrudManagementPage, InfoRow } from "@/components/common/CrudManagementPage";
import { CompatibilityForm } from "@/components/catalog/CompatibilityForm";
import { productCompatibilitiesService } from "@/services/catalog.service";
import type { ProductCompatibility } from "@/types/catalog.types";

export default function ProductCompatibilitiesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["compatibilities"],
    queryFn: productCompatibilitiesService.list,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["compatibilities"] });

  return (
    <CrudManagementPage<ProductCompatibility>
      title="Product Compatibility"
      description="Map a product type + brand to compatible brands and their models."
      rows={data}
      searchKeys={["productBrandName", "productTypeName"]}
      columns={[
        {
          key: "productBrandName",
          header: "Product Brand",
          render: (r) => <span className="font-medium">{r.productBrandName ?? "—"}</span>,
        },
        {
          key: "compatible",
          header: "Compatible Summary",
          render: (r) => (
            <div className="space-y-1">
              {(r.compatible ?? []).length === 0 && <span className="text-muted-foreground">—</span>}
              {(r.compatible ?? []).map((e, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium">{e.brandName ?? String(e.brandId)}</span>
                  <span className="text-muted-foreground">
                    {": "}
                    {(e.models ?? []).map((m) => m.name ?? String(m.id)).join(", ") || "—"}
                  </span>
                </div>
              ))}
            </div>
          ),
        },
      ]}
      formTitle="Product Compatibility"
      formContent={(record, close) => (
        <CompatibilityForm record={record} onSaved={invalidate} close={close} />
      )}
      viewContent={(r) => (
        <>
          <InfoRow label="Product Type" value={r.productTypeName} />
          <InfoRow label="Product Brand" value={r.productBrandName} />
          <InfoRow
            label="Compatible"
            value={(r.compatible ?? [])
              .map(
                (e) =>
                  `${e.brandName ?? e.brandId}: ${(e.models ?? [])
                    .map((m) => m.name ?? m.id)
                    .join(", ")}`
              )
              .join("  |  ")}
          />
        </>
      )}
      onDelete={async (r) => {
        await productCompatibilitiesService.remove(r.id);
        invalidate();
      }}
      onToggleStatus={async (r) => {
        await productCompatibilitiesService.toggleStatus(r.id, !r.isActive);
        invalidate();
      }}
    />
  );
}
