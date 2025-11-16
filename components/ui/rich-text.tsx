"use client";

import { useEffect, useState } from "react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";

import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { ParagraphNode, TextNode, $getRoot, $insertNodes } from "lexical";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";

import {
  $generateNodesFromDOM,
} from "@lexical/html";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

export default function RichText({ value, onChange }: any) {
  const [loadedHTML, setLoadedHTML] = useState<string | null>(null);

  // Prepare the HTML before editor mounts
  useEffect(() => {
    if (value?.html) {
      setLoadedHTML(value.html);
    } else {
      setLoadedHTML(""); // empty editor
    }
  }, [value]);

  // Wait until HTML loaded
  if (loadedHTML === null) return null;

  /* ----------------------- EDITOR CONFIG ----------------------- */
  const editorConfig: InitialConfigType = {
    namespace: "Editor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      ParagraphNode,
      TextNode,
      QuoteNode,
      ListNode,
      ListItemNode,
    ],

    // ⭐ Correct way: Lexical gives the editor instance here
    editorState: (editor) => {
      if (!loadedHTML) return;

      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(loadedHTML, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);

        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
    },

    onError(error) {
      console.error(error);
    },
  };

  return (
    <div className="bg-white w-full overflow-hidden rounded-lg border">
      <LexicalComposer initialConfig={editorConfig}>
        <TooltipProvider>
          <EditorContent onChange={onChange} />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

function EditorContent({ onChange }: { onChange: (data: any) => void }) {
  return (
    <>
      <ToolbarPlugin>
        {() => (
          <div className="sticky top-0 z-10 flex gap-2 overflow-auto border-b p-1 bg-white">
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatQuote />
            </BlockFormatDropDown>
            <FontFormatToolbarPlugin />
          </div>
        )}
      </ToolbarPlugin>

      <RichTextPlugin
        contentEditable={
          <ContentEditable
            placeholder="Start typing..."
            className="ContentEditable__root relative block h-72 min-h-72 overflow-auto px-8 py-4 focus:outline-none"
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <ListPlugin />
      <CheckListPlugin />

<OnChangePlugin
  onChange={(editorState) => {
    const json = editorState.toJSON();
    onChange(json);   // << store full lexical json
  }}
/>
    </>
  );
}
