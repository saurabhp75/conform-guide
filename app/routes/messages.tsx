import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "utils/db";

export async function loader() {
  const messages = await prisma.message.findMany();

  return json({ messages });
}

export default function Messages() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="mb-4">
        <Link to="/">Home</Link>
      </div>
      <h1>Messages</h1>
      <ul>
        {data.messages.map((message) => (
          <li key={message.id}>
            {message.title}: {message.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
