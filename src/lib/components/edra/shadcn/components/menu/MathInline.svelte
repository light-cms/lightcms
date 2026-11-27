<script lang="ts">
import CornerDownLeft from "@lucide/svelte/icons/corner-down-left";
import { Button } from "#lib/components/ui/button/index";
import { Input } from "#lib/components/ui/input/index";
import strings from "../../../strings";
import { BubbleMenu, getEditor, useEditorState } from "../../../tiptap/index";

const editor = getEditor();
const editorState = useEditorState({
	editor,
	selector: ({ editor }) => ({
		latex: editor.getAttributes("inlineMath").latex as string,
	}),
});
let latex = $derived($editorState.latex);

function updateLatex() {
	editor.commands.updateInlineMath({ latex });
}
</script>

<BubbleMenu
	{editor}
	pluginKey="math-inline-bubble-menu"
	shouldShow={(props) => {
		const { editor: propsEditor, state } = props;
		if (!propsEditor?.isEditable) return false;
		if (!state) return false;
		return propsEditor.isActive('inlineMath');
	}}
	options={{
		shift: true,
		autoPlacement: {
			allowedPlacements: ['top', 'bottom']
		},
		strategy: 'absolute',
		scrollTarget: editor.view.dom.parentElement ?? window
	}}
	class="z-50 flex h-fit w-fit items-center gap-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
>
	<Input
		bind:value={latex}
		onchange={updateLatex}
		placeholder={strings.menu.math.enterExpressionPlaceholder}
		class="w-64"
	/>
	<Button variant="default" size="icon" onclick={updateLatex}>
		<CornerDownLeft />
	</Button>
</BubbleMenu>
