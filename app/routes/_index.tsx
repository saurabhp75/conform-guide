import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Conform Guide" },
    { name: "description", content: "Tutorial on Conform" },
  ];
};

export default function Index() {
  return <div>Hello world!</div>;
}
