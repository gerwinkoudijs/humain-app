import { db } from "../db";

export const getTenantByUserId = async (userId: string) => {
  const tenant = await db.tenant.findFirst({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  return tenant;
};
