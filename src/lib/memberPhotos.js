import api from "@/axios";

export function normalizePhotoEntry(value) {
  if (!value) return null;
  if (typeof value === "string") return { photo: value, path: value, taken_at: null };
  if (typeof value === "object" && (value.photo || value.path || value.file)) {
    return {
      photo: value.photo || "",
      path: value.path || "",
      taken_at: value.taken_at || null,
      file: value.file || null,
      pending: !!value.pending,
    };
  }
  return null;
}

export function photoPayload(entry) {
  const normalized = normalizePhotoEntry(entry);
  if (!normalized) return null;

  return {
    photo: normalized.path || normalized.photo,
    path: normalized.path || normalized.photo,
    taken_at: normalized.taken_at || null,
  };
}

export async function uploadPendingMemberPhotos(memberId, photos) {
  const next = [null, null, null];

  for (let i = 0; i < 3; i += 1) {
    const entry = normalizePhotoEntry(photos?.[i]);
    if (!entry) continue;

    if (entry.file instanceof File) {
      const form = new FormData();
      form.append("photo", entry.file);
      form.append("member_id", String(memberId));

      const { data } = await api.post("/members/photos/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      next[i] = {
        photo: data.url || data.photo,
        path: data.path || data.url || data.photo,
        taken_at: data.taken_at || entry.taken_at || new Date().toISOString(),
      };
      continue;
    }

    next[i] = photoPayload(entry);
  }

  return next;
}
