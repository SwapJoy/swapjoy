export const getItemImageUri = (item: any, fallback?: string | null): string | null => {
  if (!item) {
    return fallback ?? null;
  }

  const direct =
    item.image_url ??
    item.primary_image_url ??
    null;

  const fromImagesArray =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]?.image_url ?? item.images[0]?.url ?? null
      : null;

  const resolved = direct ?? fromImagesArray ?? null;
  return resolved ?? fallback ?? null;
};


