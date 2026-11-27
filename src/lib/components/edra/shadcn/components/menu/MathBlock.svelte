<script lang="ts">
import { Textarea } from "#lib/components/ui/textarea";
import strings from "../../../strings";
import { BubbleMenu, getEditor, useEditorState } from "../../../tiptap/index";

const editor = getEditor();
const editorState = useEditorState({
	editor,
	selector: ({ editor }) => ({
		latex: editor.getAttributes("blockMath").latex as string,
	}),
});
let latex = $derived($editorState.latex);

function updateLatex() {
	editor.commands.updateBlockMath({ latex });
}
</script>

<BubbleMenu
	{editor}
	pluginKey="math-block-bubble-menu"
	shouldShow={(props) => {
		const { editor: propsEditor, state } = props;
		if (!propsEditor?.isEditable) return false;
		if (!state) return false;
		return propsEditor.isActive('blockMath');
	}}
	options={{
		shift: true,
		autoPlacement: {
			allowedPlacements: ['top', 'bottom']
		},
		strategy: 'absolute',
		scrollTarget: editor.view.dom.parentElement ?? window
	}}
	class="z-50 h-fit w-fit flex-col items-center gap-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
>
	<Textarea
		bind:value={latex}
		oninput={updateLatex}
		placeholder={strings.menu.math.enterExpressionPlaceholder}
		class="h-48 w-96"
	/>
</BubbleMenu>
