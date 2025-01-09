import React from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import Markdown from "./Markdown";

type Props = {
  role: string;
  content: string;
};

const MessageBox = ({ role, content }: Props) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 text-sm">
        {/* {content} */}
        <Markdown text={content} />
      </CardContent>
      {role !== "user" && (
        <CardFooter className="border-t bg-muted/50 px-6 py-3 text-xs text-muted-foreground">
          Disclaimer: The resume insights and suggestions provided by this
          application are for informational purposes only and should not be
          considered a guarantee of job success or acceptance. Please review and
          verify the suggestions before use.
        </CardFooter>
      )}
    </Card>
  );
};

export default MessageBox;
