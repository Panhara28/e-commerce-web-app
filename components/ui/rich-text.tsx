"use client";

import { useEffect, useState } from "react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";

import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import {
  HeadingNode,
  QuoteNode
} from "@lexical/rich-text";

import {
  ListItemNode,
  ListNode,
} from "@lexical/list";

import {
  ParagraphNode,
  TextNode
} from "lexical";

import { editorTheme } from "@/components/editor/themes/editor-theme";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";

export default function RichText({ initialValue, onChange }) {
  const [editorReady, setEditorReady] = useState(false);

  const editorConfig: InitialConfigType = {
    namespace: "ProductEditor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ParagraphNode,
      TextNode,
      ListNode,
      ListItemNode,
    ],

    editorState: (editor) => {
      if (!initialValue) return;

      try {
        if (initialValue?.root) {
          // JSON → editor state
          const state = editor.parseEditorState(JSON.stringify(initialValue));
          editor.setEditorState(state);
        }
      } catch (e) {
        console.error("❌ Failed to load editor state:", e);
      }
    },

    onError(error) {
      console.error("LEXICAL ERROR:", error);
    },
  };

  return (
    <div className="bg-white w-full overflow-hidden rounded-lg border">
      <LexicalComposer initialConfig={editorConfig}>
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
            onChange(json); // ALWAYS JSON
          }}
        />
      </LexicalComposer>
    </div>
  );
}
