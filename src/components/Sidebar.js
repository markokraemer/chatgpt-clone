import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, MessageSquare } from "lucide-react";

export default function Sidebar({ onNewChat, onSelectChat, currentChatId }) {
  const [chatHistories, setChatHistories] = useState([]);

  useEffect(() => {
    const storedHistories = localStorage.getItem('chatHistories');
    if (storedHistories) {
      setChatHistories(JSON.parse(storedHistories));
    }
  }, []);

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const updatedHistories = [...chatHistories, { id: newChatId, name: `Chat ${chatHistories.length + 1}` }];
    setChatHistories(updatedHistories);
    localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    onNewChat(newChatId);
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <Button onClick={handleNewChat} className="mb-4 w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <ScrollArea className="flex-grow">
        {chatHistories.map((chat) => (
          <Button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            variant={currentChatId === chat.id ? "secondary" : "ghost"}
            className="w-full justify-start mb-2"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {chat.name}
          </Button>
        ))}
      </ScrollArea>
    </div>
  );
}