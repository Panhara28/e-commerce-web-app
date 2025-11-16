// utils/convertLexical.ts
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

export async function lexicalJSONtoHTML(lexicalJson: any) {
  if (!lexicalJson || typeof lexicalJson !== "object") {
    return { html: "", text: "" };
  }

  try {
    const editor = createEditor();

    // Lexical requires JSON string format
    const jsonString = JSON.stringify(lexicalJson);
    const editorState = editor.parseEditorState(jsonString);

    editor.setEditorState(editorState);

    let html = "";
    editor.update(() => {
      html = $generateHtmlFromNodes(editor);
    });

    const text =
      lexicalJson?.root?.children?.[0]?.children?.[0]?.text || "";

    return { html, text };
  } catch (err) {
    console.error("❌ lexicalJSONtoHTML failed:", err);
    return { html: "", text: "" };
  }
}
