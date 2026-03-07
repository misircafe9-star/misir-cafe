/**
 * Converts a Supabase storage object URL to the render/image endpoint
 * which performs server-side resize + compression before Next.js caches it.
 *
 * Before: /storage/v1/object/public/bucket/file.jpg
 * After:  /storage/v1/render/image/public/bucket/file.jpg?width=N&quality=75
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number
): string {
  if (!url) return "/placeholder.svg";
  const renderUrl = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  const separator = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${separator}width=${width}&quality=75`;
}
