import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useActionData } from "@remix-run/react";
import { sendMessage } from "utils/db";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Conform Guide" },
    { name: "description", content: "Tutorial on Conform" },
  ];
};

const schema = z.object({
  // The preprocess step is required for zod to perform the required check properly
  // As the value of an empty input is an usually an empty string
  email: z
    .string({ required_error: "Email is required" })
    .email("Email is invalid"),
  message: z
    .string({ required_error: "Message is required" })
    .min(10, "Message is too short")
    .max(100, "Message is too long"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, { schema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const message = await sendMessage(submission.value);

  // Return a form error if the message is not sent
  if (!message.sent) {
    return submission.reply({
      formErrors: ["Failed to send the message. Please try again later."],
    });
  }

  return redirect("/messages");
}

export default function Index() {
  const lastResult = useActionData<typeof action>();
  // The useForm hook will return all the metadata we need to render the form
  // and focus on the first invalid field when the form is submitted
  const [form, fields] = useForm({
    // This not only sync the error from the server
    // But also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    lastResult,

    // To derive all validation attributes
    constraint: getZodConstraint(schema),
    // Validate field once user leaves the field
    shouldValidate: "onBlur",
    // Then, revalidate field as user types again
    shouldRevalidate: "onInput",
  });

  return (
    <Form
      method="POST"
      id={form.id}
      aria-invalid={form.errors ? true : undefined}
      aria-describedby={form.errors ? form.errorId : undefined}
    >
      <div id={form.errorId}>{form.errors}</div>
      <div>
        <label htmlFor={fields.email.id}>Email</label>
        <input
          id={fields.email.id}
          type="email"
          name={fields.email.name}
          defaultValue={fields.email.initialValue as string}
          required={fields.email.required}
          aria-invalid={fields.email.errors ? true : undefined}
          aria-describedby={
            fields.email.errors ? fields.email.errorId : undefined
          }
        />
        <div id={fields.email.errorId}>{fields.email.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.message.id}>Message</label>
        <textarea
          id={fields.message.id}
          name={fields.message.name}
          defaultValue={fields.message.initialValue as string}
          required={fields.message.required}
          minLength={fields.message.minLength}
          maxLength={fields.message.maxLength}
          aria-invalid={fields.message.errors ? true : undefined}
          aria-describedby={
            fields.message.errors ? fields.message.errorId : undefined
          }
        />
        <div id={fields.message.errorId}>{fields.message.errors}</div>
      </div>
      <button>Send</button>
    </Form>
  );
}
