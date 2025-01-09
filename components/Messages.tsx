import { Message } from "ai";
import React from "react";
import MessageBox from "./MessageBox";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

const Messages = ({ messages }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((m, index) => {
        return <MessageBox key={index} role={m.role} content={m.content} />;
      })}
    </div>
  );
};

export default Messages;
