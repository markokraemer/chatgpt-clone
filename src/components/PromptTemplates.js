import { Lightbulb, Code, Wand2, Sparkles } from 'lucide-react';

const templates = [
  {
    icon: <Lightbulb />,
    title: "Brainstorm ideas",
    description: "Generate creative ideas for any topic",
    text: "I need creative ideas for the following topic: "
  },
  {
    icon: <Code />,
    title: "Explain code",
    description: "Get explanations for complex code snippets",
    text: "Please explain the following code snippet: "
  },
  {
    icon: <Wand2 />,
    title: "Writing assistant",
    description: "Improve your writing with AI-powered suggestions",
    text: "Please help me improve the following text: "
  },
  {
    icon: <Sparkles />,
    title: "Creative writing",
    description: "Generate stories, poems, or creative content",
    text: "Write a short story about: "
  }
];

export default function PromptTemplates({ onSelectTemplate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {templates.map((template, index) => (
        <div
          key={index}
          className="prompt-template flex items-center space-x-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-4 rounded-lg"
          onClick={() => onSelectTemplate(template.text)}
        >
          <div className="text-blue-500">{template.icon}</div>
          <div>
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}