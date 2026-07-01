import type { ID } from "./common.types";

export type FieldInputType =
  | "text"
  | "number"
  | "select"
  | "multiSelect"
  | "textarea"
  | "file"
  | "date"
  | "radio"
  | "boolean";

export const FIELD_INPUT_TYPES: FieldInputType[] = [
  "text",
  "number",
  "select",
  "multiSelect",
  "textarea",
  "file",
  "date",
  "radio",
  "boolean",
];

/** Input types whose `options` list is used. */
export const OPTION_INPUT_TYPES: FieldInputType[] = ["select", "multiSelect", "radio"];

export interface TemplateField {
  label: string;
  key: string;
  inputType: FieldInputType | string;
  placeholder?: string;
  options?: string[];
  unit?: string;
  sortOrder?: number;
  required?: boolean;
  addMore?: boolean;
  hasUnit?: boolean;
  active?: boolean;
}

export interface TemplateGroup {
  groupName: string;
  sortOrder?: number;
  active?: boolean;
  fields: TemplateField[];
}

export interface TemplateSection {
  headingName: string;
  sortOrder?: number;
  active?: boolean;
  groups: TemplateGroup[];
}

export interface AttributeTemplate {
  id?: ID;
  categoryId: ID;
  categoryName?: string;
  subCategoryId: ID;
  subCategoryName?: string;
  productTypeId: ID;
  productTypeName?: string;
  sections: TemplateSection[];
  sectionCount?: number;
  groupCount?: number;
  fieldCount?: number;
  active?: boolean;
}
