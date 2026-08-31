import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code2, GripVertical, Heading2, Image, Italic, List, Sigma, Sparkles } from "lucide-react";
import { useState } from "react";

export default function TiptapEditor() {
  const [slashOpen, setSlashOpen] = useState(true);
  const editor = useEditor({ extensions: [StarterKit], content: `<h2>Angles tell us how far a line turns</h2><p>An angle is formed where two rays meet. We call their meeting point the <strong>vertex</strong>.</p><blockquote>A right angle is exactly one quarter of a full turn.</blockquote><h3>Try connecting this idea</h3><p>When two angles sit on a straight line, what must their total be?</p>`, editorProps: { attributes: { class: "tiptap-editor", "aria-label": "Teaching note editor" } } });
  if (!editor) return null;
  return <div className="lotion-editor"><div className="bubble-toolbar" aria-label="Text formatting"><button onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></button><button onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></button><button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></button><button onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></button><button><Code2 /></button></div><div className="block-handle"><GripVertical /><button onClick={() => setSlashOpen(!slashOpen)}>+</button></div><EditorContent editor={editor} />{slashOpen && <div className="slash-menu"><span>Insert a block</span><button onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setSlashOpen(false); }}><Heading2 /><div><strong>Heading</strong><small>Structure a section</small></div></button><button><Sigma /><div><strong>Maths</strong><small>Formula with KaTeX preview</small></div></button><button><Sparkles /><div><strong>Flashcard</strong><small>Concept or descriptor card</small></div></button><button><Image /><div><strong>Image</strong><small>Add accessible teaching media</small></div></button></div>}<p className="editor-hint">Type “/” for blocks · Drag the handle to reorder · Autosaved just now</p></div>;
}
