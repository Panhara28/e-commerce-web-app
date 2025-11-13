"use client";

import { useState } from "react";
import { ListItemNode, ListNode } from "@lexical/list";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode, EditorState, $getRoot } from "lexical";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

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
import { FontFormatToolbarPlugin } from "../editor/plugins/toolbar/font-format-toolbar-plugin";

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
  onError: (error: Error) => {
    console.error(error);
  },
};

export default function RichText({ value, onChange }: any) {
  return (
    <div className="bg-[#fff] w-full overflow-hidden rounded-lg border">
      <LexicalComposer initialConfig={editorConfig}>
        <TooltipProvider>
          <EditorContent onChange={onChange} />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}

function EditorContent({ onChange }: any) {
  return (
    <>
      <ToolbarPlugin>
        {({ blockType }) => (
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

      {/* List Plugins */}
      <ListPlugin />
      <CheckListPlugin />

      {/* 🔥 THIS IS THE FIX — capture editor JSON */}
      <OnChangePlugin
        onChange={(editorState: EditorState) => {
          editorState.read(() => {
            const json = editorState.toJSON();
            onChange && onChange(json);
          });
        }}
      />
    </>
  );
}
