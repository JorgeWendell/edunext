import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const actionClient = createSafeActionClient({
  async middleware() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    return {
      userId: session.user.id,
    };
  },
});
