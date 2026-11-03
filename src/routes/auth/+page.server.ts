import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { getAuth } from "$lib/server/auth";

const authFormSchema = z.object({
  email: z.string().trim().min(1, "Enter an email address."),
});

export const load = async () => ({
  form: await superValidate(zod4(authFormSchema), { id: "auth-magic-link" }),
});

export const actions = {
  default: async (event: { request: Request }) => {
    const form = await superValidate(event.request, zod4(authFormSchema), {
      id: "auth-magic-link",
    });

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      await getAuth().api.signInMagicLink({
        body: {
          email: form.data.email,
          callbackURL: "/cms",
          newUserCallbackURL: "/cms",
        },
        headers: event.request.headers,
      });
    } catch (cause) {
      console.error("Failed to send magic link:", cause);
      return message(form, "Failed to send magic link", { status: 500 });
    }

    return message(form, "Check your inbox for a secure sign-in link.");
  },
};
