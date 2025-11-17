import {
  LexicalEditor,
  SerializedEditorState,
  SerializedLexicalNode,
} from "lexical";
import { $generateNodesFromSerializedNodes } from "@lexical/clipboard";

export function $generateNodesFromJSON(
  editor: LexicalEditor,
  json: SerializedEditorState<SerializedLexicalNode> | null | undefined
) {
  if (!json || typeof json !== "object") return [];

  try {
    const editorState = editor.parseEditorState(JSON.stringify(json));
    editor.setEditorState(editorState);

    const jsonNodes = editorState.toJSON()?.root?.children ?? [];

    // Convert JSON children → actual Lexical nodes
    return $generateNodesFromSerializedNodes(jsonNodes);
  } catch (err) {
    console.error("❌ $generateNodesFromJSON failed:", err);
    return [];
  }
}
