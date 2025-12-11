
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProfileSEM, MatchAnalysis, GeneratedContent, QualificationStatus, JobOpening, CoverLetterTone } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const profileSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    contact: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            linkedin: { type: Type.STRING }
        }
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          achievements: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING }
        }
      }
    },
    summary: { type: Type.STRING }
  }
};

const matchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Suitability score from 0 to 100" },
    rationale: { type: Type.STRING, description: "3 sentence summary of why it is a fit" },
    keyMatches: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Two specific elements from SEM that match JD" },
    qualificationStatus: { type: Type.STRING, enum: [QualificationStatus.OVER_QUALIFIED, QualificationStatus.UNDER_QUALIFIED, QualificationStatus.PERFECTLY_SUITED] },
    qualificationReason: { type: Type.STRING, description: "Justification based on years of exp and education" },
    crossFunctionalAdvantage: { type: Type.STRING, description: "One specific skill offering competitive edge" }
  }
};

const contentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    resumeSnippet: { type: Type.STRING, description: "Full Markdown formatted resume, ATS optimized, no placeholders." },
    coverLetter: { type: Type.STRING, description: "Markdown formatted professional cover letter." },
    changeSummary: { type: Type.STRING, description: "A bulleted summary (3-4 points) explaining how the resume was tailored to the JD." }
  }
};

// --- Helper for JSON Extraction ---
const extractJson = (text: string): any => {
  if (!text) return [];
  try {
    // 1. Try finding a markdown block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : text;

    // 2. Clean up any text before the first [ or {
    const startArray = jsonStr.indexOf('[');
    const startObject = jsonStr.indexOf('{');
    
    let start = -1;
    if (startArray !== -1 && startObject !== -1) {
        start = Math.min(startArray, startObject);
    } else if (startArray !== -1) {
        start = startArray;
    } else if (startObject !== -1) {
        start = startObject;
    }

    if (start === -1) {
        // Fallback: heuristic attempt to find JSON-like structure if strictly formatted
        if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
             return JSON.parse(text);
        }
        console.warn("No JSON start found in response");
        return [];
    }

    jsonStr = jsonStr.substring(start);

    // 3. Find the last ] or }
    const endArray = jsonStr.lastIndexOf(']');
    const endObject = jsonStr.lastIndexOf('}');
    const end = Math.max(endArray, endObject);

    if (end !== -1) {
        jsonStr = jsonStr.substring(0, end + 1);
    }

    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON extraction failed", e);
    return [];
  }
};

// --- API Calls ---

export const parseProfile = async (text: string): Promise<ProfileSEM> => {
  const prompt = `
    Analyze the following unstructured professional history (Resume/CV text).
    Extract a Skills and Experience Matrix (SEM).
    Identify hard/soft skills, quantify achievements (look for numbers, %, $), and structure the history.
    CRITICAL: Extract contact details (Name, Email, Phone, Address) accurately. If not explicitly found, try to infer from header text.
    
    Text:
    ${text.substring(0, 15000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: profileSchema,
        systemInstruction: "You are an expert resume parser."
      }
    });

    const jsonText = response.text;
    return JSON.parse(jsonText || "{}");
  } catch (error) {
    console.error("Error parsing profile:", error);
    throw new Error("Failed to analyze profile documents.");
  }
};

const fetchJobBatch = async (sem: ProfileSEM, locationStr: string, radiusInt: number, offset: number, limit: number): Promise<JobOpening[]> => {
    const prompt = `
    I need you to act as a fast career scout. 
    Search the web for ${limit} REAL, LIVE job openings in or near "${locationStr}" (within ${radiusInt} miles) that match this profile.
    
    User Skills: ${sem.skills.slice(0, 10).join(', ')}...
    
    Instructions:
    - Find exactly ${limit} unique jobs.
    - **SPEED IS CRITICAL**: Find the jobs quickly. Do not spend excessive time on deep analysis for every single row.
    - **ACTIVE ONLY**: Must be posted recently (last 30 days).
    - **Direct Links**: Prefer direct company career pages.
    - **Attributes**:
        - Title, Company, Location, URL.
        - Salary (if visible).
        - Mission (short summary).
        - Glassdoor: Estimate rating/sentiment from knowledge if possible.
        - Layoffs: Mention only if widely known recently.
    
    Output strictly a JSON Array of objects.
    Structure:
    [{
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "snippet": "Short description...",
      "description": "Longer description...",
      "url": "https://...",
      "salary": "$X - $Y",
      "stockPrice": "TICKER $123",
      "mission": "Mission...",
      "greenFlag": "Eco/Charity" or null,
      "isHighPaying": true/false,
      "postingDate": "2 days ago",
      "matchScore": 90,
      "matchReason": "Why it fits...",
      "glassdoorRating": 4.0,
      "glassdoorSentiment": "Positive",
      "recentLayoffs": "None reported"
    }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Simplify tool usage to speed up
      }
    });

    const result = extractJson(response.text || "");
    return Array.isArray(result) ? result : (result?.openings || []);
  } catch (e) {
    console.warn("Batch fetch failed", e);
    return [];
  }
};

export const findDirectMatches = async (sem: ProfileSEM, location: string, postalCode: string, radius: string): Promise<JobOpening[]> => {
  const locationStr = `${location} ${postalCode}`.trim();
  const radiusInt = parseInt(radius) || 25;
  
  // Parallelize the search to speed up execution
  // We ask for 2 batches of 5 jobs concurrently instead of 1 batch of 10
  try {
      const [batch1, batch2] = await Promise.all([
          fetchJobBatch(sem, locationStr, radiusInt, 0, 5),
          fetchJobBatch(sem, locationStr, radiusInt, 5, 5)
      ]);

      let allMatches = [...batch1, ...batch2];
      
      // Deduplicate based on URL or Title+Company
      const uniqueMatches: JobOpening[] = [];
      const seen = new Set();
      
      for (const m of allMatches) {
          const key = (m.url || m.title + m.company).toLowerCase();
          if (!seen.has(key)) {
              seen.add(key);
              uniqueMatches.push(m);
          }
      }

      return uniqueMatches.slice(0, 10);
  } catch (error) {
      console.error("Error finding matches:", error);
      return [];
  }
};

export const analyzeMatch = async (sem: ProfileSEM, jdText: string): Promise<MatchAnalysis> => {
  const prompt = `
    Perform a deep semantic comparison between the User Profile (SEM) and the Job Description (JD).
    
    User Profile:
    ${JSON.stringify(sem)}
    
    Job Description:
    ${jdText.substring(0, 5000)}
    
    Task:
    1. Score suitability (0-100).
    2. Provide a 3-sentence rationale.
    3. Assess qualification.
    4. Identify cross-functional advantage.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchSchema,
        systemInstruction: "You are a senior technical recruiter."
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error analyzing match:", error);
    return {
        score: 0,
        rationale: "Analysis failed.",
        keyMatches: [],
        qualificationStatus: QualificationStatus.PERFECTLY_SUITED,
        qualificationReason: "N/A",
        crossFunctionalAdvantage: "N/A"
    };
  }
};

export const generateApplicationMaterials = async (
  sem: ProfileSEM, 
  jdText: string, 
  analysis: MatchAnalysis, 
  tone: CoverLetterTone = 'Professional'
): Promise<GeneratedContent> => {
  const prompt = `
    Generate a complete, ready-to-download, ATS-Optimized Resume and Cover Letter.
    
    User Profile: ${JSON.stringify(sem)}
    Job Description: ${jdText.substring(0, 3000)}
    Analysis: ${JSON.stringify(analysis)}
    Target Tone for Cover Letter: ${tone}
    
    CRITICAL INSTRUCTIONS:
    1. **NO PLACEHOLDERS**. Use the contact info from the profile.
       Name: ${sem.contact?.name || "Candidate Name"}
       Email: ${sem.contact?.email || ""}
       Phone: ${sem.contact?.phone || ""}
       Address: ${sem.contact?.address || ""}
    2. **NO LINKEDIN**: Do not include a LinkedIn URL in the contact header.
    3. **Format**: Use standard Markdown.
    4. **Resume**: Must be compact, max 2 pages. Tailor bullet points to JD.
    5. **Cover Letter**: Professional, persuasive, max 4 paragraphs, referencing the match rationale.
       **TONE ADUSTMENT**: The user has requested a "${tone}" tone.
       - Professional: Standard corporate, respectful, formal.
       - Casual: Friendly, approachable, less rigid, authentic.
       - Tech-Friendly: Uses industry jargon appropriately, geeky but professional.
       - Conversational: Writes like a human speaking, warm, engaging.
       - Direct: Short, punchy, gets straight to value add, no fluff.
       - Enthusiastic: High energy, eager, passionate.
    
    Also generate a 'changeSummary' explaining 3-4 key changes made to tailor the resume.
    
    Resume Structure:
    # [Name]
    **[City, State] | [Phone] | [Email]**
    ...
    
    Cover Letter Structure:
    # Cover Letter
    Dear Hiring Team,
    ...
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contentSchema,
        systemInstruction: "You are a professional resume writer specializing in ATS-friendly, optically appealing formats."
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating content:", error);
    return {
        resumeSnippet: "# Error generating resume",
        coverLetter: "Error generating cover letter",
        changeSummary: "Could not generate summary."
    };
  }
};
