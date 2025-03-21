import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useActionData } from "@remix-run/react";
import { sendMessage } from "utils/db";
import { z } from "zod";

export const meta: MetaFunction = () => {
  return [
    { title: "Conform Guide" },
    { name: "description", content: "Tutorial on Conform" },
  ];
};

const schema = z.object({
  // The preprocess step is required for zod to perform the required check properly
  // As the value of an empty input is an usually an empty string
  email: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ required_error: "Email is required" }).email("Email is invalid")
  ),
  message: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string({ required_error: "Message is required" })
      .min(10, "Message is too short")
      .max(100, "Message is too long")
  ),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Construct an object using `Object.fromEntries`
  const payload = Object.fromEntries(formData);
  // Then parse it with zod
  const result = schema.safeParse(payload);

  // Return the error to the client if the data is not valid
  if (!result.success) {
    const error = result.error.flatten();

    return {
      payload,
      formErrors: error.formErrors,
      fieldErrors: error.fieldErrors,
    };
  }

  const message = await sendMessage(result.data);

  // Return a form error if the message is not sent
  if (!message.sent) {
    return {
      payload,
      formErrors: ["Failed to send the message. Please try again later."],
      fieldErrors: {},
    };
  }

  return redirect("/messages");
}

export default function Index() {
  const result = useActionData<typeof action>();

  return (
    <Form
      method="POST"
      aria-invalid={result?.formErrors ? true : undefined}
      aria-describedby={result?.formErrors ? "contact-error" : undefined}
    >
      <div id="contact-error">{result?.formErrors}</div>
      <div>
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          name="email"
          defaultValue={result?.payload.email as string}
          required
          aria-invalid={result?.fieldErrors.email ? true : undefined}
          aria-describedby={
            result?.fieldErrors.email ? "contact-email-error" : undefined
          }
        />
        <div id="contact-email-error">{result?.fieldErrors.email}</div>
      </div>
      <div>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          defaultValue={result?.payload.message as string}
          required
          minLength={10}
          maxLength={100}
          aria-invalid={result?.fieldErrors.message ? true : undefined}
          aria-describedby={
            result?.fieldErrors.message ? "contact-email-message" : undefined
          }
        />
        <div id="contact-email-message">{result?.fieldErrors.message}</div>
      </div>
      <button>Send</button>
    </Form>
  );
}
