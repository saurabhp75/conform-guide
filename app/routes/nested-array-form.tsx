import {
  getFieldsetProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
// import { createUser } from "utils/db";
import { z } from "zod";

const ContactsFieldSetSchema = z.object({
  mobile: z.string(),
  email: z.string().optional(),
  // mobile: z
  //   .string({ required_error: "mobile no. is required" })
  //   .min(10, "Must be a valid mobile number")
  //   .max(14, "Must be a valid mobile number"),
  // email: z
  //   .string({ required_error: "Email is required" })
  //   .email("Email is invalid"),
});

// export type ContactsFieldSet = z.infer<typeof ContactsFieldSetSchema>;

export const UserEditorSchema = z.object({
  name: z.string({ required_error: "age is required" }).min(5).max(30),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    })
    .gte(1, "Age must be greater than 1")
    .lte(120, "Age must be less than 120"),
  contacts: z.array(ContactsFieldSetSchema).max(3).optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Replace `Object.fromEntries()` with the parseWithZod helper
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
      contacts: [{}],
    },
  });
  const contacts = fields.contacts.getFieldList();

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <Form method="POST" {...getFormProps(form)}>
        <h1>NestedArray form</h1>
        <label htmlFor={fields.name.id}>Name:</label>
        <input {...getInputProps(fields.name, { type: "text" })} />
        <div id={fields.name.errorId}>{fields.name.errors}</div>

        <label htmlFor={fields.age.id}>Age:</label>
        <input {...getInputProps(fields.age, { type: "number" })} />
        <div id={fields.age.errorId}>{fields.age.errors}</div>

        <ul>
          {contacts.map((contact, index) => {
            const contactFields = contact.getFieldset();
            console.log("key:", contact.key);

            return (
              <li key={contact.key} {...getFieldsetProps(contact)}>
                <label htmlFor={contactFields.mobile.id}>{`Mobile#${
                  index + 1
                }:`}</label>
                <input
                  {...getInputProps(contactFields.mobile, { type: "text" })}
                />
                <button
                  {...form.remove.getButtonProps({
                    name: fields.contacts.name,
                    index,
                  })}
                >
                  Delete
                </button>
                <div id={contactFields.mobile.errorId}>
                  {contactFields.mobile.errors}
                </div>
                <label htmlFor={contactFields.email.id}>{`Email#${
                  index + 1
                }:`}</label>
                <input
                  {...getInputProps(contactFields.email, { type: "email" })}
                />
                <div id={contactFields.email.errorId}>
                  {contactFields.email.errors}
                </div>
              </li>
            );
          })}
        </ul>
        <button
          {...form.insert.getButtonProps({
            name: fields.contacts.name,
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
