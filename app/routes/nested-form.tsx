import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { createAddress } from "utils/db";
import { z } from "zod";

// If form data has an entry ['tasks[0].content', 'Hello World'], the object constructed will become { tasks: [{ content: 'Hello World' }] }
const AddressFieldSetSchema = z.object({
  street: z
    .string({ required_error: "Street name is required" })
    .min(4, "Street name is too short")
    .max(25, "Street name is too long"),
  zipcode: z
    .string({ required_error: "zipcode is required" })
    .min(3, "zipcode is too short")
    .max(12, "zipcode too long"),
  city: z
    .string({ required_error: "city name is required" })
    .min(5, "city name is too short")
    .max(25, "city name too long"),
  country: z
    .string({ required_error: "country name is required" })
    .min(5, "country name is too short")
    .max(25, "country name too long"),
});

export const AddressSchema = z.object({
  address: AddressFieldSetSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Replace `Object.fromEntries()` with the parseWithZod helper
  const submission = parseWithZod(formData, { schema: AddressSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const address = await createAddress(submission.value);

  // Return a form error if the message is not sent
  if (!address) {
    return submission.reply({
      formErrors: ["Failed to send the message. Please try again later."],
    });
  }

  return redirect("/addresses");
}

export default function Example() {
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "address-form", // need to set the id for nested form objects
    lastResult,
    constraint: getZodConstraint(AddressSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddressSchema });
    },
  });

  const address = fields.address.getFieldset();

  return (
    <div>
      <div>
        <Link to="/">Home</Link>
      </div>
      <form method="POST" {...getFormProps(form)}>
        <div>
          <label htmlFor={address.street.id}>Street</label>
          <input {...getInputProps(address.street, { type: "text" })} />
          <div id={address.street.errorId}>{address.street.errors}</div>
        </div>
        <div>
          <label htmlFor={address.zipcode.id}>Zipcode</label>
          <input {...getInputProps(address.zipcode, { type: "text" })} />
          <div id={address.zipcode.errorId}>{address.zipcode.errors}</div>
        </div>
        <div>
          <label htmlFor={address.city.id}>City</label>
          <input {...getInputProps(address.city, { type: "text" })} />
          <div id={address.city.errorId}>{address.city.errors}</div>
        </div>
        <div>
          <label htmlFor={address.country.id}>Country</label>
          <input {...getInputProps(address.country, { type: "text" })} />
          <div id={address.country.errorId}>{address.country.errors}</div>
        </div>
        <div id={form.errorId}>{form.errors}</div>
        <button>Send</button>
      </form>
    </div>
  );
}
