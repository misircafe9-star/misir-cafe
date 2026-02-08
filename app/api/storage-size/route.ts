import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ADMIN_UID = "ddbecd32-7273-4a16-bbc1-cabb7935b06d";

async function getBucketSize(bucketName: string): Promise<number> {
  const supabaseAdmin = getSupabaseAdmin();
  let totalSize = 0;

  async function traverse(path: string = ""): Promise<void> {
    let offset = 0;
    const limit = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .list(path, { limit, offset });

      if (error || !data || data.length === 0) break;

      for (const item of data) {
        if (item.metadata?.size) {
          totalSize += item.metadata.size;
        } else {
          await traverse(`${path}${item.name}/`);
        }
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  await traverse("");
  return totalSize;
}

export async function GET() {
  try {
    // Auth kontrolü — sadece admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== ADMIN_UID) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
      return NextResponse.json(
        { error: `Bucket listesi alınamadı: ${error.message}` },
        { status: 500 }
      );
    }

    // Bizim bucket'ları filtrele (category*, event*, special_menu*)
    const ourBuckets = (buckets || []).filter(
      (b) =>
        b.name.startsWith("category") ||
        b.name.startsWith("event") ||
        b.name.startsWith("special_menu")
    );

    let totalSize = 0;
    for (const bucket of ourBuckets) {
      totalSize += await getBucketSize(bucket.name);
    }

    return NextResponse.json({ totalBytes: totalSize });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
