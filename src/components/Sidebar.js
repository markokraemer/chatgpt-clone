import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { PlusCircle, MessageSquare, Trash2, Edit2 } from "lucide-react";

export default function Sidebar({ onNewChat, onSelectChat, onDeleteChat, onRenameChat, currentChatId }) {
  const [chatHistories, setChatHistories] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');

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

  const handleDeleteChat = (chatId) => {
    const updatedHistories = chatHistories.filter(chat => chat.id !== chatId);
    setChatHistories(updatedHistories);
    localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    onDeleteChat(chatId);
  };

  const handleRenameChat = (chatId) => {
    if (editingChatId === chatId) {
      const updatedHistories = chatHistories.map(chat => 
        chat.id === chatId ? { ...chat, name: editingChatName } : chat
      );
      setChatHistories(updatedHistories);
      localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
      onRenameChat(chatId, editingChatName);
      setEditingChatId(null);
    } else {
      setEditingChatId(chatId);
      setEditingChatName(chatHistories.find(chat => chat.id === chatId).name);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      <Button onClick={handleNewChat} className="mb-4 w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <ScrollArea className="flex-grow">
        {chatHistories.map((chat) => (
          <div key={chat.id} className="flex items-center mb-2">
            {editingChatId === chat.id ? (
              <Input
                value={editingChatName}
                onChange={(e) => setEditingChatName(e.target.value)}
                onBlur={() => handleRenameChat(chat.id)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameChat(chat.id)}
                className="flex-grow mr-2 text-black"
              />
            ) : (
              <Button
                onClick={() => onSelectChat(chat.id)}
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className="flex-grow justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.name}
              </Button>
            )}
            <Button onClick={() => handleRenameChat(chat.id)} variant="ghost" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button onClick={() => handleDeleteChat(chat.id)} variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}