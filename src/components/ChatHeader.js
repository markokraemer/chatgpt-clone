import { Button } from "@/components/ui/button";

export default function ChatHeader({ onClearConversation }) {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">ChatGPT Clone</h1>
      <Button onClick={onClearConversation} variant="outline" className="text-white border-white hover:bg-gray-700">
        Clear Conversation
      </Button>
    </div>
  );
}