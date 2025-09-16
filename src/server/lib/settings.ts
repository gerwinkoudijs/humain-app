import { db } from "./db";

export const listSettings = async (category: string) => {
  return await db.settings.findMany({
    where: {
      category,
    },
    orderBy: { name: "asc" },
  });
};

export const updateSetting = async (name: string, value: string) => {
  return await db.settings.update({
    where: {
      name,
    },
    data: {
      value: value,
    },
  });
};
