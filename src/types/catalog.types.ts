import type { ID } from "./common.types";

export interface Category {
  id: ID;
  name: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface SubCategory {
  id: ID;
  categoryId: ID;
  categoryName?: string;
  name: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface Brand {
  id: ID;
  name: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface ProductType {
  id: ID;
  subCategoryId?: ID;
  subCategoryName?: string;
  name: string;
  isActive: boolean;
}

export interface ProductModel {
  id: ID;
  categoryId?: ID;
  brandId: ID;
  brandName?: string;
  name: string;
  modelNumber?: string;
  isActive: boolean;
}

export interface CategoryBrand {
  id: ID;
  categoryId: ID;
  categoryName?: string;
  brandId: ID;
  brandName?: string;
  brandLogoUrl?: string;
  active?: boolean;
  isActive?: boolean;
}

export interface ProductAttribute {
  id: ID;
  name: string;
  values: string[];
  isActive: boolean;
}

export interface CompatibleModelRef {
  id: ID;
  name?: string;
}

export interface CompatibleEntry {
  brandId: ID;
  brandName?: string;
  /** Present on responses (resolved names). */
  models?: CompatibleModelRef[];
  /** Sent on requests. */
  modelIds?: ID[];
  notes?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface ProductCompatibility {
  id: ID;
  productTypeId: ID;
  productTypeName?: string;
  subCategoryId?: ID;
  subCategoryName?: string;
  productBrandId: ID;
  productBrandName?: string;
  compatible: CompatibleEntry[];
  isActive: boolean;
  active?: boolean;
}
