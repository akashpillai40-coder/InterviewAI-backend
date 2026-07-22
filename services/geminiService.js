
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model:  "gemini-flash-latest",
});

// generate interview questions
const generateQuestions = async (role, difficulty, count) => {
  try {
    const prompt = `You are a senior technical interviewer.
Generate ${count} interview questions for a ${role} role at ${difficulty} level.
Return ONLY a JSON array of strings. No extra text, no markdown, no explanation.
Example: ["Question 1?", "Question 2?"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // clean response — remove markdown fences if present
    const cleaned = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);

    return questions;
  }catch (error) {
  console.error("Gemini generateQuestions error:", error.message);

  throw new Error("Failed to generate questions", {
    cause: error,
  });
}
};

// evaluate a single answer
const evaluateAnswer = async (question, answer, role, difficulty) => {
  try {
    const prompt = `You are a senior technical interviewer evaluating a candidate's answer.
Question: ${question}
Candidate's answer: ${answer}
Role: ${role}
Difficulty: ${difficulty}

Return ONLY a JSON object with this exact structure, no extra text, no markdown:
{"score": 75, "feedback": "Your explanation was clear but missed X...", "improvements": "Consider mentioning Y..."}

Score must be a number between 0 and 100.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // clean response
    const cleaned = text.replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    return evaluation;
  } catch (error) {
    console.error('Gemini evaluateAnswer error:', error.message);
    // fallback so app never crashes
    return {
      score: 0,
      feedback: 'AI evaluation unavailable. Please try again.',
      improvements: 'Please retry after some time.'
    };
  }
};

module.exports = { generateQuestions, evaluateAnswer };