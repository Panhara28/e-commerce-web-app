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


// utils/convertHTMLtoLexicalJSON.ts

import {
  $generateNodesFromDOM,
} from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";

export async function convertHTMLtoLexicalJSON(htmlString: string) {
  if (!htmlString || typeof htmlString !== "string") {
    return defaultEmptyLexicalState();
  }

  try {
    // Create an in-memory Lexical editor to parse HTML → JSON
    const { createEditor } = await import("lexical");
    const editor = createEditor();

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlString, "text/html");

      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });

    // Return Lexical JSON
    return editor.getEditorState().toJSON();
  } catch (err) {
    console.error("❌ convertHTMLtoLexicalJSON failed:", err);
    return defaultEmptyLexicalState();
  }
}

export function defaultEmptyLexicalState() {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [],
    },
  };
}
