// server/src/services/resumeParser.js
const fs = require('fs').promises;
const pdf = require('pdf-parse');

class ResumeParser {
    async parsePDF(filePath) {
        try {
            // Read PDF file
            const dataBuffer = await fs.readFile(filePath);
            
            // Parse PDF
            const pdfData = await pdf(dataBuffer);
            
            // Extract text
            const text = pdfData.text;
            
            // Clean and structure the text
            const structuredData = this.extractSections(text);
            
            return {
                rawText: text,
                structuredData: structuredData,
                summary: this.generateSummary(text)
            };
        } catch (error) {
            console.error('PDF Parse Error:', error);
            throw new Error('Failed to parse PDF');
        }
    }

    extractSections(text) {
        const sections = {
            contact: this.extractContactInfo(text),
            education: this.extractEducation(text),
            experience: this.extractExperience(text),
            skills: this.extractSkills(text),
            projects: this.extractProjects(text)
        };
        return sections;
    }

    extractContactInfo(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}/g;
        const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
        
        return {
            emails: text.match(emailRegex) || [],
            phones: text.match(phoneRegex) || [],
            linkedin: text.match(linkedinRegex) || []
        };
    }

    extractEducation(text) {
        const educationKeywords = ['B\.?Tech', 'B\.?E', 'B\.?Sc', 'M\.?Tech', 'M\.?Sc', 
                                  'Bachelor', 'Master', 'PhD', 'University', 'College', 'Institute'];
        const lines = text.split('\n');
        const educationLines = lines.filter(line => 
            educationKeywords.some(keyword => 
                new RegExp(keyword, 'i').test(line)
            )
        );
        return educationLines.slice(0, 5);
    }

    extractExperience(text) {
        const expKeywords = ['Experience', 'Work History', 'Employment', 'Internship', 
                            'Software Engineer', 'Developer', 'Frontend', 'Backend'];
        const lines = text.split('\n');
        const expLines = lines.filter(line => 
            expKeywords.some(keyword => 
                new RegExp(keyword, 'i').test(line)
            )
        );
        return expLines.slice(0, 10);
    }

    extractSkills(text) {
        const techSkills = [
            'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS',
            'MongoDB', 'SQL', 'Express', 'TypeScript', 'Redux', 'AWS', 'Docker',
            'Git', 'REST API', 'GraphQL', 'Firebase', 'Next.js', 'Vue.js'
        ];
        
        const foundSkills = techSkills.filter(skill => 
            new RegExp(skill, 'i').test(text)
        );
        
        return [...new Set(foundSkills)]; // Remove duplicates
    }

    extractProjects(text) {
        const projectKeywords = ['Project', 'Developed', 'Built', 'Created', 'Implemented'];
        const lines = text.split('\n');
        const projectLines = lines.filter(line => 
            projectKeywords.some(keyword => 
                new RegExp(keyword, 'i').test(line)
            )
        );
        return projectLines.slice(0, 5);
    }

    generateSummary(text) {
        // Extract key information for AI
        const skills = this.extractSkills(text).join(', ');
        const experience = this.extractExperience(text).join(' | ');
        
        return `Skills: ${skills}. Experience: ${experience}`;
    }
}

module.exports = new ResumeParser();