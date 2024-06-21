import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect, useActionData } from "@remix-run/react";
import { sendMessage } from "utils/db";
import { z } from "zod";

const schema = z.object({
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
    // This not only sync the error sent from the server
    // But also used as the default value of the form
    // in case the document is reloaded for progressive enhancement
    lastResult,

    // Derive html validation attributes for each field
    constraint: getZodConstraint(schema),
    
    // When to validate, default is 'onSubmit'
    // shouldValidate: "onBlur", // "onSubmit"|"onBlur"|"onInput"
    
    // When to re-validate each field after it is validated,
    // defaults to value of shouldValidate
    // shouldRevalidate: "onInput", // "onSubmit"|"onBlur"|"onInput"
    
    // Enable client side validation
    // Run this funtion when the form is (re)validated
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    
    // called before form is submitted. If onValidate is set, 
    // it will be called only if client validation passes
    // onSubmit()
  });

  return (
    <Form method="POST" {...getFormProps(form)}>
      <div>
        <label htmlFor={fields.email.id}>Email</label>
        <input {...getInputProps(fields.email, { type: "email" })} />
        <div id={fields.email.errorId}>{fields.email.errors}</div>
      </div>
      <div>
        <label htmlFor={fields.message.id}>Message</label>
        <textarea {...getTextareaProps(fields.message)} />
        <div id={fields.message.errorId}>{fields.message.errors}</div>
      </div>
      <div id={form.errorId}>{form.errors}</div>
      <button>Send</button>
    </Form>
  );
}
