import { Avatar } from "@/components/ui/avatar";

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end space-x-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          <span className="sr-only">{message.role}</span>
          {isUser ? '👤' : isSystem ? '🔧' : '🤖'}
        </Avatar>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser ? 'bg-blue-500 text-white' : 
          isSystem ? 'bg-gray-300 text-gray-800' : 
          'bg-gray-200 text-gray-800'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}