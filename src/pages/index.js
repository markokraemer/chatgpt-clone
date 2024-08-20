import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import { Loader2, Sun, Moon, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistories, setChatHistories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isChatLoading } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "An error occurred while sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const storedHistories = localStorage.getItem('chatHistories');
    if (storedHistories) {
      setChatHistories(JSON.parse(storedHistories));
    }
  }, []);

  const saveChatHistory = useCallback(() => {
    if (currentChatId && messages.length > 0) {
      const updatedHistories = { ...chatHistories, [currentChatId]: { name: `Chat ${Object.keys(chatHistories).length + 1}`, messages } };
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
    setMessages(chatHistories[chatId]?.messages || []);
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

  const handleClearAllChats = () => {
    setChatHistories({});
    localStorage.removeItem('chatHistories');
    setCurrentChatId(null);
    setMessages([]);
    toast({
      title: "All Chats Cleared",
      description: "All chat histories have been cleared.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        currentChatId={currentChatId}
        chatHistories={chatHistories}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
          <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Clear All Chats</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your chat histories.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllChats}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
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
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>
              Customize your chat experience here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                AI Model
              </Label>
              <Select
                id="model"
                value={selectedModel}
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}