export function timeAgo(date: Date | null): string {
	if (!date) return "Never";
	const s = Math.floor((Date.now() - date.getTime()) / 1000);
	if (s < 60) return "Just now";
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}
