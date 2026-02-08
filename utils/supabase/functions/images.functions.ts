// Resim yükleme — server-side API route üzerinden (dinamik bucket desteği)
export const uploadImage = async (
  file: File,
  type: "event" | "category" | "special_menu"
): Promise<string | undefined> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      console.log("Upload error", err.error);
      return undefined;
    }

    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

// Resim silme — server-side API route üzerinden
export const deleteImage = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch("/api/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Delete error", err.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("DeleteImage exception", error);
    return false;
  }
};

// Storage toplam boyutu — server-side API route üzerinden
export async function getImagesSize(): Promise<number> {
  try {
    const res = await fetch("/api/storage-size");

    if (!res.ok) {
      throw new Error("Storage size alınamadı");
    }

    const data = await res.json();
    return data.totalBytes;
  } catch (error) {
    console.error("getImagesSize error", error);
    return 0;
  }
}
