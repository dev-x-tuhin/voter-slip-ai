import { GoogleGenAI, Type } from "@google/genai";
import { VoterInfo, SearchCriteria } from "../types";

const parseFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to normalize Unicode strings to NFC (fixes broken Bengali characters)
const normalizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item));
  } else if (typeof data === 'object' && data !== null) {
    const newData: any = {};
    for (const key in data) {
      newData[key] = normalizeData(data[key]);
    }
    return newData;
  } else if (typeof data === 'string') {
    let text = data;
    // 1. Unicode Normalization Form C
    text = text.normalize('NFC');
    
    // 2. Fix common OCR issues in Bengali:
    // Remove spaces between a Consonant and a Vowel Sign (Matra)
    // Range \u0980-\u09FF is Bengali. 
    // \u09BE-\u09CC, \u09D7 are Vowel Signs (Matras) & Au Length Mark
    text = text.replace(/([\u0985-\u09B9\u09CE-\u09DC\u09DF-\u09E1])\s+([\u09BE-\u09CC\u09D7\u09E2\u09E3])/g, '$1$2');
    
    // Remove spaces between Consonant and Hasant (Virama) for conjuncts
    text = text.replace(/([\u0985-\u09B9])\s+(\u09CD)/g, '$1$2');
    
    // Remove spaces after Hasant before next Consonant
    text = text.replace(/(\u09CD)\s+([\u0985-\u09B9])/g, '$1$2');

    return text.trim();
  }
  return data;
};

export const searchInVoterSlip = async (
  file: File, 
  criteria: SearchCriteria
): Promise<VoterInfo[] | null> => {
  // Graceful check for API Key to prevent immediate crash if env is missing in static build
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure your environment is configured correctly.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const base64Data = await parseFileToBase64(file);

  // Construct a prompt based on provided criteria
  let searchDescription = "Find ALL voter entries that match the following criteria: ";
  const conditions = [];
  
  // Generic Smart Search Query
  if (criteria.query) {
    conditions.push(`The entry matches the generic search query: '${criteria.query}'. 
    - Check if this query matches the 'Voter ID' or 'EPIC Number' (allowing for OCR errors).
    - Check if it matches the 'Name' (allowing for phonetic or spelling variations).
    - Check if it matches the 'Father's/Husband's Name'.`);
  }

  // Specific Fields
  if (criteria.voterId) {
    if (criteria.exactMatchVoterId) {
      conditions.push(`Voter ID/EPIC Number EXACTLY matching '${criteria.voterId}' (case-insensitive)`);
    } else {
      conditions.push(`Voter ID/EPIC Number similar to '${criteria.voterId}' (allow for OCR errors like 0/O, 1/I, S/5, or partial ID matches)`);
    }
  }
  
  if (criteria.name) {
    if (criteria.exactMatchName) {
      conditions.push(`Name EXACTLY matching '${criteria.name}' (case-insensitive)`);
    } else {
      conditions.push(`Name similar to '${criteria.name}' (consider phonetic variations, partial matches, spelling differences, abbreviations like Md/Mohammad, or name reordering)`);
    }
  }
  
  if (criteria.fatherName) {
    conditions.push(`Father's/Husband's Name similar to '${criteria.fatherName}'`);
  }
  
  if (conditions.length === 0) {
    throw new Error("Please provide at least one search criterion.");
  }
  
  searchDescription += conditions.join(" AND ");

  const model = 'gemini-3-flash-preview'; 

  const generateParams = {
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        },
        {
          text: `You are an intelligent data extraction assistant. Analyze the provided voter list or slip document carefully.
          
          TASK:
          ${searchDescription}.
          
          GUIDELINES:
          1. **Matching Logic**:
             - **Find ALL Matches**: Do not stop at the first match. Return an array containing EVERY entry that matches the criteria.
             - **Exact Match**: Text must match character-for-character, ignoring case.
             - **Similar/Fuzzy Match**: 
               - Allow for partial name matches (e.g., searching "Rahim" matches "Rahim Uddin").
               - Allow for common name variations and abbreviations (e.g., "Md" = "Mohammad", "Ch." = "Chandra").
               - Allow for phonetic similarities (e.g., "Khatun" vs "Khatoon").
               - Allow for reordered names (e.g., "Kumar Anil" vs "Anil Kumar").
               - For IDs, allow for common OCR confusion (e.g., 'S' vs '5', 'O' vs '0', 'B' vs '8').

          2. **Bengali Text Handling (CRITICAL)**:
             - Ensure all extracted Bengali text is in **NFC (Normalization Form C)**.
             - **FIX BROKEN VOWELS**: If you see a consonant followed by a space and then a vowel sign (e.g., "ক" + " " + " ি"), JOIN THEM immediately (e.g., "কি").
             - **FIX CONJUNCTS**: Do not let Hasant (Virama) stand alone. Join it with the next consonant.
          
          3. **Result**:
             - Return a JSON ARRAY.
             - If no entry is found matching the criteria, strictly return an empty array [].
          `
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
              voterId: { type: Type.STRING, nullable: true },
              name: { type: Type.STRING, nullable: true },
              fatherOrHusbandName: { type: Type.STRING, nullable: true },
              age: { type: Type.STRING, nullable: true },
              gender: { type: Type.STRING, nullable: true },
              address: { type: Type.STRING, nullable: true },
              pollingStation: { type: Type.STRING, nullable: true },
              slNo: { type: Type.STRING, nullable: true },
              partNo: { type: Type.STRING, nullable: true },
            },
        }
      },
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  // Implement Retry Logic with Exponential Backoff
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let currentDelay = 2000; // Start with 2 seconds

  while (true) {
    try {
      const response = await ai.models.generateContent(generateParams);
      const text = response.text;
      
      if (!text || text === 'null') {
        return [];
      }
      
      // Parse the result which is now an array
      let parsed = JSON.parse(text);
      
      // Apply Normalization to fix broken Bengali characters
      parsed = normalizeData(parsed);

      if (Array.isArray(parsed)) {
          return parsed as VoterInfo[];
      } else if (typeof parsed === 'object') {
          // Fallback if model returns single object despite instructions
          return [parsed as VoterInfo];
      }
      return [];

    } catch (error: any) {
      // Check for 429 (Quota Exceeded / Rate Limit) or 503 (Service Unavailable)
      const isQuotaError = 
        error?.status === 429 || 
        error?.code === 429 || 
        error?.error?.code === 429 ||
        error?.status === 503 ||
        (error?.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')));

      if (isQuotaError && retryCount < MAX_RETRIES) {
        console.warn(`Gemini API Busy/Quota (429/503). Retrying in ${currentDelay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await wait(currentDelay);
        retryCount++;
        currentDelay *= 2; // Exponential backoff
        continue;
      }

      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};