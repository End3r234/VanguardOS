// Opens the floating VanguardOS AI assistant panel from anywhere in the app.
export function openAIAssistant() {
  window.dispatchEvent(new CustomEvent('open-ai-assistant'));
}