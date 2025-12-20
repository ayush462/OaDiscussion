export const normalizeCompanyName = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") // remove spaces, dots, hyphens
    .trim();
