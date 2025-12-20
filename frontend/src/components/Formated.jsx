import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FormattedText({ content }) {
  if (!content) return null;

  return (
    <div
      className="
        prose prose-invert max-w-none
        prose-headings:text-white
        prose-headings:font-semibold
        prose-p:text-gray-300
        prose-li:text-gray-300
        prose-strong:text-white
        prose-hr:border-white/20
        prose-code:text-indigo-300
        prose-pre:bg-[#020617]
        prose-pre:border
        prose-pre:border-white/10
        prose-pre:rounded-lg
        prose-pre:p-4
        prose-pre:text-sm
        prose-pre:overflow-x-auto
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
