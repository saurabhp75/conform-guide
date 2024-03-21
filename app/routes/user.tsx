import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "utils/db";

export async function loader() {
  const users = await prisma.user.findMany({
    include: {
      contacts: true,
    },
  });

  return json({ users });
}

export default function Messages() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Users</h1>
      <ol>
        {data.users.map((user) => {
          return (
            <li key={user.id}>
              <div>Name: {user.name}</div>
              <div>Age: {user.age}</div>
              <ul>
                {user.contacts.map((contact) => (
                  <li key={contact.id}>
                    <p>mobile: {contact.mobile}</p>
                    <p>email: {contact.email}</p>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
