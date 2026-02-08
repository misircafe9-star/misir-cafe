import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ADMIN_UID = "ddbecd32-7273-4a16-bbc1-cabb7935b06d";

export async function POST(req: Request) {
  try {
    // Auth kontrolü — sadece admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== ADMIN_UID) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url gerekli" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const storagePrefix = `${supabaseUrl}/storage/v1/object/public/`;

    // Supabase URL'si değilse skip
    if (!url.startsWith(storagePrefix)) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // URL'den bucket adı ve dosya yolunu parse et
    // Format: https://xxx.supabase.co/storage/v1/object/public/{bucket_name}/{filename}
    const path = url.replace(storagePrefix, "");
    const slashIndex = path.indexOf("/");

    if (slashIndex === -1) {
      return NextResponse.json(
        { error: "Geçersiz URL formatı" },
        { status: 400 }
      );
    }

    const bucketName = path.substring(0, slashIndex);
    const filePath = path.substring(slashIndex + 1);

    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return NextResponse.json(
        { error: `Silme hatası: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
