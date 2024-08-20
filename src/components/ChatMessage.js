import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`chat-message ${isUser ? 'user-message' : 'assistant-message'} mb-4`}
    >
      <div className="flex items-start space-x-4">
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          <span className="sr-only">{message.role}</span>
          {isUser ? '👤' : '🤖'}
        </Avatar>
        <div className={`chat-message-content flex-1 overflow-hidden ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'} rounded-lg p-4`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}