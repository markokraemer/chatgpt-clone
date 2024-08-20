import { Avatar } from "@/components/ui/avatar";

export default function ChatMessage({ message }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end space-x-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8">
          <span className="sr-only">{message.role}</span>
          {message.role === 'user' ? '👤' : '🤖'}
        </Avatar>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}