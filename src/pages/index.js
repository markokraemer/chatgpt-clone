import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import PromptTemplates from '@/components/PromptTemplates';
import { Loader2, Sun, Moon, Settings, Send, User, X, Menu } from "lucide-react";
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
  const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { messages, input, handleInputChange, handleSubmit, setMessages, setInput, isLoading: isChatLoading } = useChat({
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
      const parsedHistories = JSON.parse(storedHistories);
      setChatHistories(parsedHistories);
      
      // If there are existing chat histories, set the current chat to the most recent one
      const chatIds = Object.keys(parsedHistories);
      if (chatIds.length > 0) {
        const mostRecentChatId = chatIds[chatIds.length - 1];
        setCurrentChatId(mostRecentChatId);
        setMessages(parsedHistories[mostRecentChatId].messages || []);
      }
    } else {
      // If no chat histories exist, create an initial chat thread
      const initialChatId = Date.now().toString();
      const initialChat = {
        name: "New Chat",
        messages: []
      };
      const initialHistories = { [initialChatId]: initialChat };
      setChatHistories(initialHistories);
      setCurrentChatId(initialChatId);
      localStorage.setItem('chatHistories', JSON.stringify(initialHistories));
    }
  }, [setMessages]);

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
    setIsMobileMenuOpen(false);
  };

  const handleDeleteChat = (chatId) => {
    const updatedHistories = { ...chatHistories };
    delete updatedHistories[chatId];
    setChatHistories(updatedHistories);
    localStorage.setItem('chatHistories', JSON.stringify(updatedHistories));
    if (currentChatId === chatId) {
      const remainingChatIds = Object.keys(updatedHistories);
      if (remainingChatIds.length > 0) {
        const newCurrentChatId = remainingChatIds[remainingChatIds.length - 1];
        setCurrentChatId(newCurrentChatId);
        setMessages(updatedHistories[newCurrentChatId].messages || []);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
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

  const handleSelectTemplate = (templateText) => {
    console.log('Template selected:', templateText);
    setIsProcessingTemplate(true);
    setInput(templateText);
    setTimeout(() => setIsProcessingTemplate(false), 500);
  };

  const handleClearInput = () => {
    setInput('');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col md:flex-row h-screen bg-white dark:bg-gray-900">
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
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
        </div>
        <div className="hidden md:block">
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
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b">
            <div className="flex items-center">
              <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden mr-2" variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold">ChatGPT</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={toggleTheme} variant="ghost" size="icon">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
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
            <div className="flex items-end space-x-2">
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Message ChatGPT..."
                  className="pr-10 min-h-[60px] max-h-[200px] resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isProcessingTemplate}
                />
                {input && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={handleClearInput}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={isChatLoading || isProcessingTemplate} className="mb-1">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send, Shift+Enter for new line
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