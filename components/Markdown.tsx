import React from "react";
import ReactMarkdown from "react-markdown";

type Props = {
  text: string;
};

const Markdown: React.FC<Props> = ({ text }) => {
  return <ReactMarkdown>{text}</ReactMarkdown>;
};

export default Markdown;
