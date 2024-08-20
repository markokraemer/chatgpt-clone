import { Lightbulb, Code, Wand2, Sparkles } from 'lucide-react';

const templates = [
  {
    icon: <Lightbulb />,
    title: "Brainstorm ideas",
    description: "Generate creative ideas for any topic"
  },
  {
    icon: <Code />,
    title: "Explain code",
    description: "Get explanations for complex code snippets"
  },
  {
    icon: <Wand2 />,
    title: "Writing assistant",
    description: "Improve your writing with AI-powered suggestions"
  },
  {
    icon: <Sparkles />,
    title: "Creative writing",
    description: "Generate stories, poems, or creative content"
  }
];

export default function PromptTemplates({ onSelectTemplate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {templates.map((template, index) => (
        <div
          key={index}
          className="prompt-template flex items-center space-x-4"
          onClick={() => onSelectTemplate(template.title)}
        >
          <div className="text-blue-500">{template.icon}</div>
          <div>
            <h3 className="font-semibold">{template.title}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}