// index.ts
import { chatbotHandler } from './chatbotHandler.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask() {
  rl.question('\n🧑 입력: ', async (input) => {
    if (input.trim().toLowerCase() === 'exit') {
      rl.close();
      process.exit(0);
    }
    try {
      const result = await chatbotHandler(input);
      console.log('🤖 AI 응답:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('에러:', err);
    }
    ask();
  });
}

ask();
