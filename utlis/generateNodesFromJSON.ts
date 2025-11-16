// utils/lexical/generateNodesFromJSON.ts

import { $getRoot, LexicalEditor } from "lexical";

/**
 * Convert Lexical JSON → Node instances that can be $insertNodes()
 */
export function $generateNodesFromJSON(editor: LexicalEditor, json: any) {
  if (!json || typeof json !== "object") return [];

  try {
    const root = $getRoot();

    const editorState = editor.parseEditorState(JSON.stringify(json));
    editor.setEditorState(editorState);

    // Return all children nodes from the parsed state
    const nodes = editorState.read(() => {
      return root.getChildren().map((node) => node.clone());
    });

    return nodes;
  } catch (err) {
    console.error("❌ $generateNodesFromJSON failed:", err);
    return [];
  }
}


