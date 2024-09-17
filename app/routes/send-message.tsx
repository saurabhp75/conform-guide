import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { dummyAsyncCheck, sendMessage } from "utils/db";
import { z } from "zod";
import { msgSchema } from "./form-resource";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: msgSchema.superRefine(async (data, ctx) => {
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
