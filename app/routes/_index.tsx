import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Conform Guide" },
    { name: "description", content: "Tutorial on Conform" },
  ];
};

export default function Index() {
  return (
    <>
      <div>
        <Link to="without-conform">Form without conform</Link>
      </div>
      <div>
        <Link to="regular-form">Regular form</Link>
      </div>
      <div>
        <Link to="array-form">Array form</Link>
      </div>
      <div>
        <Link to="nested-form">Nested object form</Link>
      </div>
      <div>
        <Link to="nested-array-form">Nested array form</Link>
      </div>
      <div>
        <Link to="async-valid">Async validation</Link>
      </div>
      <div>
        <Link to="form-resource">Form action in other(resource) route</Link>
      </div>
      <div>
        <Link to="todos">To Do</Link>
      </div>
    </>
  );
}
