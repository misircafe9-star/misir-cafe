import { CategoryForMenu } from "@/types/category.type";
import { supabase } from "../client";
import { MenuItem } from "@/types/menu-item.type";
import { MenuCategory } from "@/types/ui.types";

export const getMenu = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id,title,description,image_url, items:menu_items(id,name,description,price,is_popular,is_active)"
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
};

export const getCategoriesWithItems = async (): Promise<MenuCategory[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*, items:menu_items(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { ascending: true, referencedTable: "menu_items" });

  if (error) throw error;
  return (data || []) as unknown as MenuCategory[];
};

export const getSpecialMenus = async () => {
  const { data, error } = await supabase
    .from("special_menus")
    .select("id,name,description,price,image_url,is_active");
  if (error) throw error;
  return data;
};

export const getEvents = async () => {
  const { data, error } = await supabase.from("events").select("*");
  if (error) throw error;
  return data;
};
