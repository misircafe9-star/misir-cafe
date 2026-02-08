import { addEventType } from "@/types/event.type";
import { supabase } from "../client";
import { deleteImage } from "./images.functions";

export const addEvent = async (values: addEventType) => {
  const { data, error } = await supabase
    .from("events")
    .insert([values])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getEvents = async () => {
  const { data, error } = await supabase.from("events").select();
  if (error) throw error;
  return data;
};

export const updateEvent = async (id: string, values: addEventType) => {
  const { data, error } = await supabase
    .from("events")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  try {
    // 1️⃣ Event bilgilerini al, özellikle image_url
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("id, image_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!event) throw new Error("Event bulunamadı");

    // 2️⃣ Eğer image_url varsa Storage'dan sil
    if (event.image_url) {
      await deleteImage(event.image_url);
    }

    // 3️⃣ Event tablosundan sil
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
};
