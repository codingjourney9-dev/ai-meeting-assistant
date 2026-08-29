
import { env } from '../config/env.js'
import OpenAI from 'openai'


export async function generateMeetingSummary(transcriptText) {
  console.log(`[llm] Starting summarization (${transcriptText.length} chars)`)

  if (!env.OPENAI_API_KEY) {
    console.warn('[llm] OPENAI_API_KEY not set - returning stub. Add your key to server/.env')
    return stubSummary()
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  console.log('[llm] Attempting OpenAI summarization')

  const prompt = `You are a meeting summarization assistant. Analyze this meeting transcript and extract:

1. A 2-4 sentence overview of what was discussed (or just a brief description if very short)
2. Key points (main topics covered)
3. Action items (tasks that need to be done, with who is responsible if mentioned)
4. Decisions (things that were explicitly agreed upon)

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format:
{
  "overview": "2-4 sentence overview here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "actionItems": ["action 1 - who is responsible", "action 2"],
  "decisions": ["decision 1", "decision 2"]
}

CRITICAL INSTRUCTION: If the transcript is extremely short or trivial (e.g., just greetings, mic checks, or very few words), DO NOT leave the overview or keyPoints empty. You MUST generate at least one descriptive bullet point for keyPoints (e.g., "Brief greetings were exchanged" or "Audio/video check was performed"). Only use an empty array [] for actionItems and decisions if absolutely nothing actionable was said. Do not add any text before or after the JSON.

MEETING TRANSCRIPT:
${transcriptText}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      response_format: { type: "json_object" },
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    })

    const jsonText = completion.choices[0].message.content
    
    if (!jsonText) {
      throw new Error('OpenAI returned empty response.')
    }

    console.log('[llm] Got response, parsing JSON...')
    const summary = JSON.parse(jsonText)

    function ensureStringArray(field) {
      if (!field) return []
      if (Array.isArray(field)) {
        return field.map(item => String(item))
      }
      return [String(field)]
    }

    console.log('[llm] Summary generated successfully!')

    return {
      overview: summary.overview || '',
      keyPoints: ensureStringArray(summary.keyPoints),
      actionItems: ensureStringArray(summary.actionItems),
      decisions: ensureStringArray(summary.decisions),
    }

  } catch (err) {
    console.error('[llm] Failed to generate summary with OpenAI:', err.message)
    console.warn('[llm] Returning stub summary instead so the user can test the UI.')
    return stubSummary(err.message)
  }
}


function stubSummary(errorMessage = null) {
  const reason = errorMessage ? `API Error: ${errorMessage}` : 'OpenAI API key is missing in server/.env';
  
  return {
    overview:
      `STUB SUMMARY: Failed to generate summary. ${reason}`,
    keyPoints: ['Failed to generate summary', reason],
    actionItems: ['Check OpenAI API key and billing credits', 'Restart server if environment variables changed'],
    decisions: ['Use a valid and funded OpenAI key for high quality summaries'],
  }
}
