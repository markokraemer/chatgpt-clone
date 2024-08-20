import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ChatMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          <span className="sr-only">{message.role}</span>
          {message.role === 'user' ? '👤' : '🤖'}
        </Avatar>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'}`}>
          {message.content}
        </div>
      </div>
    </motion.div>
  );
}