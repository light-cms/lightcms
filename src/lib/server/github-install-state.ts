import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_SEPARATOR = ".";

function sign(payload: string, secret: string) {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createGitHubInstallState(userId: string, secret: string) {
	const payload = `${randomBytes(32).toString("base64url")}${STATE_SEPARATOR}${Buffer.from(userId).toString("base64url")}`;
	return `${payload}${STATE_SEPARATOR}${sign(payload, secret)}`;
}

export function verifyGitHubInstallState(
	expectedState: string,
	receivedState: string,
	userId: string,
	secret: string,
) {
	if (!expectedState || !receivedState) return false;

	const parts = expectedState.split(STATE_SEPARATOR);
	if (parts.length !== 3) return false;

	const [nonce, encodedUserId, signature] = parts;
	if (!nonce || !encodedUserId || !signature) return false;

	let stateUserId: string;
	try {
		stateUserId = Buffer.from(encodedUserId, "base64url").toString("utf8");
	} catch {
		return false;
	}

	const expected = Buffer.from(expectedState);
	const received = Buffer.from(receivedState);
	const expectedSignature = Buffer.from(
		sign(`${nonce}.${encodedUserId}`, secret),
	);
	const actualSignature = Buffer.from(signature);
	return (
		stateUserId === userId &&
		expected.length === received.length &&
		timingSafeEqual(expected, received) &&
		expectedSignature.length === actualSignature.length &&
		timingSafeEqual(expectedSignature, actualSignature)
	);
}
