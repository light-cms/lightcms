import { createTransport } from "nodemailer";

export async function sendMail({
	html,
	to,
	subject,
	text,
}: {
	html?: string;
	to: string;
	subject: string;
	text: string;
}) {
	const mailHost = process.env.MAIL_HOST;
	const mailPort = Number(process.env.MAIL_PORT);
	const mailUser = process.env.MAIL_USER;
	const mailPass = process.env.MAIL_PASS;
	const mailFrom = process.env.MAIL_FROM;
	const rawSecure = process.env.MAIL_SECURE!;

	if (!mailHost) {
		throw new Error("MAIL_HOST is not configured");
	}
	if (!mailUser || !mailPass) {
		throw new Error("MAIL_USER / MAIL_PASS are not configured");
	}
	if (!mailFrom) {
		throw new Error("MAIL_FROM is not configured");
	}

	if (!Number.isFinite(mailPort)) throw new Error("MAIL_PORT must be a number");

	const explicitSecure =
		rawSecure.length > 0
			? ["true", "1", "yes", "on"].includes(rawSecure)
			: null;
	const isSecure = explicitSecure === null ? mailPort === 465 : explicitSecure;

	const transporter = createTransport({
		host: mailHost,
		port: mailPort,
		secure: isSecure,
		auth: {
			user: mailUser,
			pass: mailPass,
		},
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 10_000,
	});

	try {
		await transporter.sendMail({
			from: mailFrom,
			to,
			subject,
			text,
			html,
		});
	} catch (error) {
		throw new Error(`Failed to send email to ${to}`, { cause: error });
	}
}
