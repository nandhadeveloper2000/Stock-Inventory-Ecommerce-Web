import { apiRequest } from "@/lib/axios";
import type { ID } from "@/types/common.types";
import type { AttributeTemplate, TemplateSection } from "@/types/attribute-template.types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface SaveTemplatePayload {
  categoryId: ID;
  subCategoryId: ID;
  productTypeId: ID;
  sections: TemplateSection[];
  active?: boolean;
}

interface PageEnvelope<T> {
  content: T[];
  totalElements: number;
}

export const attributeTemplatesService = {
  /** List all saved templates. */
  list: async (): Promise<AttributeTemplate[]> => {
    const env = await apiRequest<ApiEnvelope<PageEnvelope<AttributeTemplate> | AttributeTemplate[]>>({
      url: "/catalog/attribute-templates",
      params: { size: 200 },
    });
    const data = env.data;
    return Array.isArray(data) ? data : data?.content ?? [];
  },

  setActive: async (id: ID, active: boolean): Promise<void> => {
    await apiRequest({
      method: "PATCH",
      url: `/catalog/attribute-templates/${id}/active`,
      params: { active },
    });
  },

  remove: async (id: ID): Promise<void> => {
    await apiRequest({ method: "DELETE", url: `/catalog/attribute-templates/${id}` });
  },

  /** Returns the saved template for a selection, or null if none exists yet. */
  getBySelection: async (
    categoryId: ID,
    subCategoryId: ID,
    productTypeId: ID
  ): Promise<AttributeTemplate | null> => {
    const env = await apiRequest<ApiEnvelope<AttributeTemplate | null>>({
      url: "/catalog/attribute-templates/by-selection",
      params: { categoryId, subCategoryId, productTypeId },
    });
    return env.data ?? null;
  },

  /** Create or replace the template for a selection. */
  save: async (payload: SaveTemplatePayload): Promise<AttributeTemplate> => {
    const env = await apiRequest<ApiEnvelope<AttributeTemplate>>({
      method: "PUT",
      url: "/catalog/attribute-templates/save",
      data: payload,
    });
    return env.data;
  },
};
