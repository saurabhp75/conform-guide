import {
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { z } from "zod";

export const UserEditorSchema = z.object({
  name: z.string({ required_error: "age is required" }).min(5).max(30),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    })
    .gte(1, "Age must be greater than 1")
    .lte(120, "Age must be less than 120"),
  emails: z.array(z.string()),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: UserEditorSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  // const user = await createUser(submission.value);
  // console.log({ user });
  // // Return a form error if the message is not sent
  // if (!user) {
  //   return submission.reply({
  //     formErrors: ["Failed to send the message. Please try again later."],
  //   });
  // }

  return redirect("/user");
}

export default function Example() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    // id: "address-form", // need to set the id for nested form objects
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserEditorSchema });
    },
    shouldValidate: "onBlur",
    constraint: getZodConstraint(UserEditorSchema),
    // shouldRevalidate: "onInput",
    defaultValue: {
      emails: [''],
    },
  });
  const emails = fields.emails.getFieldList();

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <Form method="POST" {...getFormProps(form)}>
        <h1>Array form</h1>
        <label htmlFor={fields.name.id}>Name:</label>
        <input {...getInputProps(fields.name, { type: "text" })} />
        <div id={fields.name.errorId}>{fields.name.errors}</div>

        <label htmlFor={fields.age.id}>Age:</label>
        <input {...getInputProps(fields.age, { type: "number" })} />
        <div id={fields.age.errorId}>{fields.age.errors}</div>

        <ul>
          {emails.map((email, index) => {
            return (
              <li key={email.key}>
                <label htmlFor={email.id}>{`Email#${index + 1}:`}</label>
                <input {...getInputProps(email, { type: "text" })} />
                <button
                  {...form.remove.getButtonProps({
                    name: fields.emails.name,
                    index,
                  })}
                >
                  Delete
                </button>
                <div id={fields.emails.errorId}>{fields.emails.errors}</div>
              </li>
            );
          })}
        </ul>
        <button
          {...form.insert.getButtonProps({
            name: fields.emails.name,
          })}
        >
          Add contact
        </button>
        <div id={form.errorId}>{form.errors}</div>
        <button>Submit</button>
      </Form>
    </div>
  );
}
