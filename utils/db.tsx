import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";

export const prisma = remember("prisma", () => {
  // NOTE: if you change anything in this function you'll need to restart
  // the dev server to see your changes.
  const client = new PrismaClient();
  client.$connect();
  return client;
});

type SendMessageParams = { email: string; message: string };

export async function sendMessage(
  data: SendMessageParams
): Promise<{ sent: string | null }> {
  const win = Math.random() > 0.5;

  console.log({win});

  if (win) return { sent: null };

  const post = await prisma.message.create({
    data: { title: data.email, content: data.message },
  });

  return { sent: post.title };
}
