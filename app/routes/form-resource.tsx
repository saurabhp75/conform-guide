import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Link, useFetcher } from "@remix-run/react";
import { z } from "zod";
import { action } from "./send-message";
import { GeneralErrorBoundary } from "~/components/error-boundary";

export const msgSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Email is invalid"),
  message: z
    .string({ required_error: "Message is required" })
    .min(10, "Message is too short")
    .max(100, "Message is too long"),
});

export default function Index() {
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    lastResult: fetcher.data?.result,
    constraint: getZodConstraint(msgSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: msgSchema });
    },
  });

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <p>
          This form is implemented using fetcher, which post on a different
          route
        </p>
      </div>
      <fetcher.Form
        method="POST"
        {...getFormProps(form)}
        action="/send-message"
      >
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
      </fetcher.Form>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        403: () => <p>Yeah(403), you cant be here...</p>,
        400: () => <p>Yeah(400), you cant be here...</p>,
      }}
    />
  );
}
