import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ADMIN_UID = "ddbecd32-7273-4a16-bbc1-cabb7935b06d";

const BUCKET_SIZE_LIMIT = 49 * 1024 * 1024; // 45MB eşik (50MB hard limit, 5MB tampon)
const VALID_TYPES = ["category", "event", "special_menu"] as const;
type ImageType = (typeof VALID_TYPES)[number];

async function getBucketSize(bucketName: string): Promise<number> {
  const supabaseAdmin = getSupabaseAdmin();
  let totalSize = 0;
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .list("", { limit, offset });

    if (error || !data || data.length === 0) break;

    for (const item of data) {
      if (item.metadata?.size) {
        totalSize += item.metadata.size;
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return totalSize;
}

async function findAvailableBucket(type: ImageType): Promise<string> {
  const supabaseAdmin = getSupabaseAdmin();

  // Tüm bucket'ları listele
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();

  // Bu type'a ait bucket'ları bul ve sırala
  const typeBuckets = (buckets || [])
    .filter((b) => b.name === type || b.name.startsWith(`${type}_`))
    .sort((a, b) => {
      const numA = a.name === type ? 1 : parseInt(a.name.split("_").pop() || "1");
      const numB = b.name === type ? 1 : parseInt(b.name.split("_").pop() || "1");
      return numA - numB;
    });

  if (typeBuckets.length === 0) {
    // Hiç bucket yok, ilkini oluştur
    const { error } = await supabaseAdmin.storage.createBucket(type, {
      public: true,
    });
    if (error) throw new Error(`Bucket oluşturulamadı: ${error.message}`);
    return type;
  }

  // Son bucket'ın boyutunu kontrol et
  const lastBucket = typeBuckets[typeBuckets.length - 1];
  const size = await getBucketSize(lastBucket.name);

  if (size < BUCKET_SIZE_LIMIT) {
    return lastBucket.name;
  }

  // Son bucket dolu, yeni oluştur
  const nextNum = typeBuckets.length + 1;
  const newBucketName = `${type}_${nextNum}`;

  const { error } = await supabaseAdmin.storage.createBucket(newBucketName, {
    public: true,
  });
  if (error) throw new Error(`Bucket oluşturulamadı: ${error.message}`);

  // Yeni bucket için RLS policy'leri zaten wildcard olarak tanımlı (supabase-setup.sql)
  return newBucketName;
}

export async function POST(req: Request) {
  try {
    // Auth kontrolü — sadece admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== ADMIN_UID) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "file ve type gerekli" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type as ImageType)) {
      return NextResponse.json(
        { error: "Geçersiz type. Geçerli: category, event, special_menu" },
        { status: 400 }
      );
    }

    // Uygun bucket'ı bul (doluysa yenisini oluştur)
    const bucketName = await findAvailableBucket(type as ImageType);

    // Dosya adını oluştur
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Yükle
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json(
        { error: `Yükleme hatası: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Public URL oluştur
    const { data } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
