// server/src/services/aiEngine.js
const { HfInference } = require('@huggingface/inference');
const axios = require('axios');

class AIEngine {
    constructor() {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }

    // Generate question based on resume
    async generateQuestionFromResume(resumeText, jobRole = 'Software Developer') {
        const prompt = `You are a technical interviewer. Generate ONE specific interview question based on the candidate's resume.

RESUME SUMMARY:
${resumeText}

JOB ROLE: ${jobRole}

Generate a technical question that:
1. Tests knowledge mentioned in their resume
2. Is appropriate for their experience level
3. Has practical relevance
4. Is challenging but fair

Return ONLY the question text:`;

        try {
            // Try Hugging Face (FREE)
            const response = await this.hf.textGeneration({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                inputs: prompt,
                parameters: {
                    max_new_tokens: 150,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false
                }
            });
            
            let question = response.generated_text.trim();
            
            // Clean up the response
            question = question.replace(/^["']|["']$/g, ''); // Remove quotes
            question = question.split('\n')[0]; // Take first line
            
            return question || this.getFallbackQuestion(resumeText);
            
        } catch (error) {
            console.error('AI Error:', error.message);
            return this.getFallbackQuestion(resumeText);
        }
    }

    getFallbackQuestion(resumeText) {
        // Extract skills from resume for fallback
        const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Database'];
        const foundSkills = skills.filter(skill => 
            resumeText.toLowerCase().includes(skill.toLowerCase())
        );
        
        const tech = foundSkills.length > 0 ? foundSkills[0] : 'programming';
        
        const questions = [
            `Explain your experience with ${tech} and a project where you used it.`,
            `What are the key concepts of ${tech} that you find most important?`,
            `How would you debug a performance issue in a ${tech} application?`,
            `Describe a challenging problem you solved using ${tech}.`,
            `What are the best practices for ${tech} development?`
        ];
        
        return questions[Math.floor(Math.random() * questions.length)];
    }

    // Evaluate answer
    async evaluateAnswer(question, answer, resumeContext = '') {
        const prompt = `Evaluate this interview answer:

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
RESUME CONTEXT: ${resumeContext}

Provide evaluation in this JSON format:
{
    "score": 0-10,
    "feedback": "detailed feedback",
    "strengths": ["strength1", "strength2"],
    "improvements": ["area1", "area2"]
}`;

        try {
            const response = await this.hf.textGeneration({
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300,
                    temperature: 0.3,
                    return_full_text: false
                }
            });

            const text = response.generated_text.trim();
            
            // Try to parse JSON
            try {
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                const jsonStr = text.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonStr);
            } catch (parseError) {
                // If JSON parsing fails, return default
                return {
                    score: 7,
                    feedback: "Good answer. Could provide more specific examples.",
                    strengths: ["Relevant to question"],
                    improvements: ["Add more technical details"]
                };
            }
            
        } catch (error) {
            console.error('Evaluation Error:', error);
            return this.defaultEvaluation(answer);
        }
    }

    defaultEvaluation(answer) {
        const length = answer.split(' ').length;
        const score = Math.min(10, Math.max(5, length / 20));
        
        return {
            score: Math.round(score),
            feedback: "Answer received. Keep practicing!",
            strengths: ["Answered the question"],
            improvements: ["Could elaborate more"]
        };
    }
}

module.exports = new AIEngine();