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
      className={`chat-message ${isUser ? 'user-message' : 'assistant-message'}`}
    >
      <Avatar className="w-8 h-8">
        <span className="sr-only">{message.role}</span>
        {isUser ? '👤' : '🤖'}
      </Avatar>
      <div className="chat-message-content">
        {message.content}
      </div>
    </motion.div>
  );
}