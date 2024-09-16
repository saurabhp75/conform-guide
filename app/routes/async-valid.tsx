import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, Link, redirect, useActionData } from "@remix-run/react";
import { dummyAsyncCheck, sendMessage } from "utils/db";
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

  const submission = await parseWithZod(formData, {
    schema: schema.superRefine(async (data, ctx) => {
      const message = await dummyAsyncCheck(data.email);
      if (!message) {
        ctx.addIssue({
          // path specifies the field in error
          // If omitted then it is considered as form error
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "Email already exists(dummy error check)",
        });
        return;
      }
    }),
    async: true,
  });

  // This has already been done at the client side
  // const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const message = await sendMessage(submission.value);

  if (!message.sent) {
    return json({
      result: submission.reply({
        formErrors: ["Failed to send the message. Please try again later."],
      }),
    });
  }
  return redirect("/messages");
}

export default function Index() {
  const lastResult = useActionData<typeof action>();

  console.dir(lastResult);

  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
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
    </div>
  );
}
