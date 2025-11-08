import bcrypt from "bcryptjs";

import { db } from "@/lib/prisma";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("123456", 12);

  await db.user.upsert({
    where: { email: "admin@epis.com" },
    update: {},
    create: {
      email: "admin@epis.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created: admin@epis.com / 123456");
}

createAdmin();
