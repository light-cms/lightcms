export class IsMobile {
	current = false;
	constructor() {
		if (typeof window !== "undefined") {
			const media = window.matchMedia("(max-width: 768px)");
			this.current = media.matches;
			media.addEventListener("change", (e) => {
				this.current = e.matches;
			});
		}
	}
}
