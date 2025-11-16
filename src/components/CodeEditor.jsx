export default function CodeEditor({ code }) {
  return (
    <pre className="bg-gray-900 text-green-300 p-4 rounded-md overflow-x-auto">
      <code>{code}</code>
    </pre>
  );
}