import { env } from '../config/env.js';






async function callAssemblyAiForInsights(transcriptText) {
  
  
  
  

  const key = env.ASSEMBLYAI_API_KEY;
  if (!key) throw new Error('ASSEMBLYAI_API_KEY not configured');

  
  
  
  const url = 'https://api.assemblyai.com/v2/your-insights-endpoint';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: transcriptText }),
    
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`AssemblyAI request failed ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  
  return data;
}



function heuristicExtract(transcriptText) {
  const sentences = transcriptText
    .replace(/\n+/g, '. ')
    .split(/[.?!]\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const actionItems = [];
  const decisions = [];
  const keyPoints = [];

  const actionKeywords = ['action', 'todo', 'please', 'should', 'will', 'assign', 'follow up', 'follow-up', 'deliverable', 'owner', 'responsible'];
  const decisionKeywords = ['decide', 'decided', 'decision', 'agree', 'agreed', "we'll", "we will", "let's"]; 

  sentences.forEach((s) => {
    const lower = s.toLowerCase();

    
    if (s.length < 140 && /\b(discuss|topic|update|plan|roadmap|deadline)\b/i.test(s)) {
      keyPoints.push(s);
    }

    
    if (actionKeywords.some(k => lower.includes(k))) {
      
      let candidate = s.replace(/^-\s*/, '');
      if (!actionItems.includes(candidate)) actionItems.push(candidate);
    }

    
    if (decisionKeywords.some(k => lower.includes(k))) {
      let candidate = s.replace(/^-\s*/, '');
      if (!decisions.includes(candidate)) decisions.push(candidate);
    }
  });

  
  if (!actionItems.length && sentences.length) {
    const first = sentences.slice(0, 3);
    keyPoints.push(...first.filter(p => !keyPoints.includes(p)));
  }

  return {
    overview: transcriptText.slice(0, 600),
    keyPoints: Array.from(new Set(keyPoints)).slice(0, 10),
    actionItems: actionItems.slice(0, 20),
    decisions: decisions.slice(0, 20),
  };
}

export async function extractInsights(transcriptText) {
  
  if (env.ASSEMBLYAI_API_KEY) {
    try {
      const remote = await callAssemblyAiForInsights(transcriptText);
      
      return {
        overview: remote.overview || transcriptText.slice(0, 600),
        keyPoints: remote.keyPoints || remote.topics || [],
        actionItems: remote.actionItems || [],
        decisions: remote.decisions || [],
      };
    } catch (err) {
      console.warn('[assembly] AssemblyAI call failed, falling back to heuristics:', err.message || err);
      return heuristicExtract(transcriptText);
    }
  }

  return heuristicExtract(transcriptText);
}
