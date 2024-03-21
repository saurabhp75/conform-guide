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
  if (win) return { sent: null };

  const post = await prisma.message.create({
    data: { title: data.email, content: data.message },
  });

  return { sent: post.title };
}

type CreateAddressParams = {
  address: {
    street: string;
    zipcode: string;
    city: string;
    country: string;
  };
};

export async function createAddress(data: CreateAddressParams) {
  const win = Math.random() > 0.5;
  if (win) return { sent: null };

  const address = await prisma.address.create({
    data: {
      street: data.address.street,
      zipcode: data.address.zipcode,
      city: data.address.city,
      country: data.address.country,
    },
  });

  return address;
}

type CreateUserParams = {
  contacts: {
    email: string;
  }[];
};

export async function createUser(data: CreateUserParams) {
  const win = Math.random() > 0.5;
  if (win) {
    console.log("### Toss failed ###");
    return null;
  }

  if (!data.contacts) {
    console.log("### No contacts ###");
    return null;
  }

  // try {
  //   const user = await prisma.user.create({
  //     data: {
  //       contacts: {
  //         create: data.contacts.map((contact) => ({
  //           email: contact.email,
  //         })),
  //       },
  //     },
  //   });

  //   return user;
  // } catch (e) {
  //   console.log("Error inserting user in db");
  //   return null;
  // }
}
