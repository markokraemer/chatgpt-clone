import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { PlusCircle, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function Sidebar({ onNewChat, onSelectChat, onDeleteChat, onRenameChat, currentChatId, chatHistories }) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    onNewChat(newChatId);
  };

  const handleDeleteChat = (chatId) => {
    onDeleteChat(chatId);
  };

  const handleRenameChat = (chatId) => {
    if (editingChatId === chatId) {
      onRenameChat(chatId, editingChatName);
      setEditingChatId(null);
    } else {
      setEditingChatId(chatId);
      setEditingChatName(chatHistories[chatId]?.name || '');
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col"
    >
      <Button onClick={handleNewChat} className="mb-4 w-full">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <ScrollArea className="flex-grow">
        {Object.entries(chatHistories).map(([chatId, chat]) => (
          <motion.div
            key={chatId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center mb-2"
          >
            {editingChatId === chatId ? (
              <Input
                value={editingChatName}
                onChange={(e) => setEditingChatName(e.target.value)}
                onBlur={() => handleRenameChat(chatId)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameChat(chatId)}
                className="flex-grow mr-2 text-black"
              />
            ) : (
              <Button
                onClick={() => onSelectChat(chatId)}
                variant={currentChatId === chatId ? "secondary" : "ghost"}
                className="flex-grow justify-start"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.name}
              </Button>
            )}
            <Button onClick={() => handleRenameChat(chatId)} variant="ghost" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteChat(chatId)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        ))}
      </ScrollArea>
    </motion.div>
  );
}