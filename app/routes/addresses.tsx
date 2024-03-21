import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "utils/db";

export async function loader() {
  const addresses = await prisma.address.findMany();

  return json({ addresses });
}
 
export default function Messages() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Addresses</h1>
      <ul>
        {data.addresses.map((address) => (
          <li key={address.id}>
            {address.street}:{address.zipcode}:{address.city}: {address.country}
          </li>
        ))}
      </ul>
    </div>
  );
}
