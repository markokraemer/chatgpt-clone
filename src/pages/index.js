import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import PromptTemplates from '@/components/PromptTemplates';
import { Loader2, Sun, Moon, Settings, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h2 className="text-lg font-semibold">Something went wrong:</h2>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Try again
      </button>
    </div>
  )
}

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistories, setChatHistories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [editingChatName, setEditingChatName] = useState(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isChatLoading } = useChat({
    api: '/api/chat',
    body: { model: selectedModel },
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
      const updatedHistories = { 
        ...chatHistories, 
        [currentChatId]: { 
          ...chatHistories[currentChatId],
          messages 
        } 
      };
      setChatHistories(updatedHistories);
      localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    }
  }, [currentChatId, messages, chatHistories]);

  useEffect(() => {
    saveChatHistory();
  }, [saveChatHistory]);

  const handleNewChat = () => {
    setIsLoading(true);
    const newChatId = Date.now().toString();
    const chatName = prompt("Enter a name for the new chat:");
    if (chatName) {
      const updatedHistories = { ...chatHistories, [newChatId]: { name: chatName, messages: [] } };
      setChatHistories(updatedHistories);
      localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
      setCurrentChatId(newChatId);
      setMessages([]);
    }
    setIsLoading(false);
  };

  const handleSelectChat = (chatId) => {
    setIsLoading(true);
    setCurrentChatId(chatId);
    setMessages(chatHistories[chatId]?.messages || []);
    setIsLoading(false);
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
    setEditingChatName(null);
  };

  const handleExportChat = () => {
    if (currentChatId && messages.length > 0) {
      const confirmExport = window.confirm("Are you sure you want to export this chat?");
      if (confirmExport) {
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

  const handleSelectTemplate = (template) => {
    handleSubmit({ preventDefault: () => {} }, { prompt: template });
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col md:flex-row h-screen bg-white dark:bg-gray-900">
        <Sidebar
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          currentChatId={currentChatId}
          chatHistories={chatHistories}
          editingChatName={editingChatName}
          setEditingChatName={setEditingChatName}
        />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b">
            <h1 className="text-2xl font-bold">ChatGPT</h1>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="ghost" size="icon">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">Clear All Chats</Button>
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
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-4">How can I help you today?</h2>
                <PromptTemplates onSelectTemplate={handleSelectTemplate} />
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, i) => (
                  <ChatMessage key={i} message={message} />
                ))}
              </AnimatePresence>
            )}
            {isChatLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Message ChatGPT..."
                className="flex-1"
              />
              <Button type="submit" disabled={isChatLoading}>
                <Send className="h-4 w-4" />
              </Button>
              <Button onClick={handleExportChat} disabled={!currentChatId || messages.length === 0} variant="outline">
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
    </ErrorBoundary>
  );
}