import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { PlusCircle, MessageSquare, Trash2, Edit2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function Sidebar({ onNewChat, onSelectChat, onDeleteChat, onRenameChat, currentChatId, chatHistories, editingChatName, setEditingChatName }) {
  const [localChatHistories, setLocalChatHistories] = useState(chatHistories);

  useEffect(() => {
    setLocalChatHistories(chatHistories);
  }, [chatHistories]);

  const handleNewChat = () => {
    onNewChat();
  };

  const handleDeleteChat = (chatId) => {
    onDeleteChat(chatId);
  };

  const handleRenameChat = (chatId, newName) => {
    onRenameChat(chatId, newName);
    setEditingChatName(null);
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full md:w-64 h-auto md:h-screen bg-gray-100 text-gray-800 p-4 flex flex-col"
    >
      <Button onClick={handleNewChat} className="mb-4 w-full bg-gray-200 text-gray-800 hover:bg-gray-300">
        <PlusCircle className="mr-2 h-4 w-4" /> New Chat
      </Button>
      <ScrollArea className="flex-grow">
        {Object.entries(localChatHistories).map(([chatId, chat]) => (
          <motion.div
            key={chatId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center mb-2"
          >
            {editingChatName === chatId ? (
              <Input
                value={chat.name}
                onChange={(e) => onRenameChat(chatId, e.target.value)}
                onBlur={() => setEditingChatName(null)}
                onKeyPress={(e) => e.key === 'Enter' && setEditingChatName(null)}
                className="flex-grow mr-2 text-black"
              />
            ) : (
              <Button
                onClick={() => onSelectChat(chatId)}
                variant={currentChatId === chatId ? "secondary" : "ghost"}
                className="flex-grow justify-start text-left px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {chat.name}
              </Button>
            )}
            <Button onClick={() => setEditingChatName(chatId)} variant="ghost" size="icon">
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