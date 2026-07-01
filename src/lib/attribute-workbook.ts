import type {
  AttributeTemplate,
  TemplateField,
  TemplateSection,
} from "@/types/attribute-template.types";

const HEADERS = [
  "Section",
  "Group",
  "Field Name",
  "Field Key",
  "Input Type",
  "Placeholder",
  "Options",
  "Unit",
  "Required",
  "Add More",
  "Active",
] as const;

function slugKey(label: string): string {
  return (label || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function truthy(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "yes" || s === "y" || s === "1";
}

/** Case-insensitive cell lookup across possible header aliases. */
function cell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
    if (found !== undefined) {
      const v = String(row[found] ?? "").trim();
      if (v !== "") return v;
    }
  }
  return "";
}

/** Build and download an .xlsx of the template's fields (or a starter row if empty). */
export async function exportTemplateWorkbook(
  template: Pick<AttributeTemplate, "sections">,
  fileName = "attribute-template.xlsx"
): Promise<void> {
  const XLSX = await import("xlsx");
  const rows: Record<string, string>[] = [];

  for (const s of template.sections ?? []) {
    for (const g of s.groups ?? []) {
      const fields = g.fields ?? [];
      if (fields.length === 0) {
        rows.push({ Section: s.headingName, Group: g.groupName });
        continue;
      }
      for (const f of fields) {
        rows.push({
          Section: s.headingName,
          Group: g.groupName,
          "Field Name": f.label ?? "",
          "Field Key": f.key ?? "",
          "Input Type": f.inputType ?? "text",
          Placeholder: f.placeholder ?? "",
          Options: (f.options ?? []).join(" | "),
          Unit: f.unit ?? "",
          Required: f.required ? "true" : "false",
          "Add More": f.addMore ? "true" : "false",
          Active: f.active === false ? "false" : "true",
        });
      }
    }
  }

  if (rows.length === 0) {
    rows.push({
      Section: "Product Details",
      Group: "Basic Info",
      "Field Name": "Item Name",
      "Field Key": "itemname",
      "Input Type": "text",
      Placeholder: "",
      Options: "",
      Unit: "",
      Required: "true",
      "Add More": "false",
      Active: "true",
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS as unknown as string[] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fields");
  XLSX.writeFile(wb, fileName);
}

/** Parse an uploaded .xlsx/.csv into a section -> group -> field tree (order preserved). */
export async function parseTemplateWorkbook(file: File): Promise<TemplateSection[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const sections: TemplateSection[] = [];
  const sectionByName = new Map<string, TemplateSection>();

  for (const row of rows) {
    const label = cell(row, "Field Name", "Label", "Field");
    if (!label) continue;

    const sectionName = cell(row, "Section", "Section Name", "Tab") || "Product Details";
    const groupName = cell(row, "Group", "Group Name") || "General";

    let section = sectionByName.get(sectionName);
    if (!section) {
      section = { headingName: sectionName, active: true, sortOrder: sections.length + 1, groups: [] };
      sections.push(section);
      sectionByName.set(sectionName, section);
    }
    let group = section.groups.find((g) => g.groupName === groupName);
    if (!group) {
      group = { groupName, active: true, sortOrder: section.groups.length + 1, fields: [] };
      section.groups.push(group);
    }

    const optionsRaw = cell(row, "Options");
    const options = optionsRaw
      ? optionsRaw.split(/[|,\n]/).map((o) => o.trim()).filter(Boolean)
      : [];
    const unit = cell(row, "Unit");

    const field: TemplateField = {
      label,
      key: cell(row, "Field Key", "Key") || slugKey(label),
      inputType: cell(row, "Input Type", "Type") || "text",
      placeholder: cell(row, "Placeholder"),
      options,
      unit,
      sortOrder: group.fields.length + 1,
      required: truthy(cell(row, "Required")),
      addMore: truthy(cell(row, "Add More", "AddMore")),
      hasUnit: unit !== "",
      active: cell(row, "Active").toLowerCase() !== "false",
    };
    group.fields.push(field);
  }

  return sections;
}
