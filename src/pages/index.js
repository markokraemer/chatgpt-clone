import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistories, setChatHistories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isChatLoading } = useChat();

  useEffect(() => {
    const storedHistories = localStorage.getItem('chatHistories');
    if (storedHistories) {
      setChatHistories(JSON.parse(storedHistories));
    }
  }, []);

  const saveChatHistory = useCallback(() => {
    if (currentChatId && messages.length > 0) {
      const updatedHistories = { ...chatHistories, [currentChatId]: messages };
      setChatHistories(updatedHistories);
      localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    }
  }, [currentChatId, messages, chatHistories]);

  useEffect(() => {
    saveChatHistory();
  }, [saveChatHistory]);

  const handleNewChat = (chatId) => {
    setCurrentChatId(chatId);
    setMessages([]);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setMessages(chatHistories[chatId] || []);
  };

  const handleDeleteChat = (chatId) => {
    const updatedHistories = { ...chatHistories };
    delete updatedHistories[chatId];
    setChatHistories(updatedHistories);
    localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleRenameChat = (chatId, newName) => {
    const updatedHistories = { ...chatHistories };
    if (updatedHistories[chatId]) {
      updatedHistories[chatId] = { ...updatedHistories[chatId], name: newName };
      setChatHistories(updatedHistories);
      localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    }
  };

  const handleExportChat = () => {
    if (currentChatId && messages.length > 0) {
      const chatContent = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_export_${currentChatId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Chat Exported",
        description: "Your chat history has been exported successfully.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        currentChatId={currentChatId}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}
          {isChatLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white dark:bg-gray-800">
          <div className="flex space-x-4">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={isChatLoading}>Send</Button>
            <Button onClick={handleExportChat} disabled={!currentChatId || messages.length === 0}>
              Export Chat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}