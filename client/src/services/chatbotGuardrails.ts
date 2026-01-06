// Chatbot Guardrails Service - Content Safety Filtering
import guardrailConfig from '../config/chatbotGuardrails.json';

export interface GuardrailResult {
    safe: boolean;
    action: 'ALLOW' | 'BLOCK' | 'SAFE_REDIRECT' | 'ESCALATE';
    category?: string;
    message?: string;
    matchedKeywords?: string[];
}

export interface Incident {
    studentId: string;
    category: string;
    message: string;
    timestamp: Date;
    action: string;
}

// Normalize text to handle obfuscation
function normalizeText(text: string): string {
    let normalized = text.toLowerCase().trim();

    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');

    // Handle leetspeak replacements
    const leetspeak = guardrailConfig.patterns.leetspeak;
    Object.entries(leetspeak).forEach(([letter, replacements]) => {
        replacements.forEach(rep => {
            normalized = normalized.replace(new RegExp(rep, 'g'), letter);
        });
    });

    // Remove separators between characters (f.u.c.k → fuck)
    guardrailConfig.patterns.separators.forEach(sep => {
        const pattern = new RegExp(`([a-z])\\${sep}(?=[a-z])`, 'g');
        normalized = normalized.replace(pattern, '$1');
    });

    // Handle repeated characters (fuuuck → fuck)
    normalized = normalized.replace(/(.)\1{2,}/g, '$1');

    return normalized;
}

// Check if text matches educational allowlist
function isEducationalContext(text: string, _category: string): boolean {
    const normalized = normalizeText(text);

    // Check if text contains educational indicators
    const eduIndicators = [
        'what is', 'explain', 'how does', 'can you teach', 'help me understand',
        'biology', 'science', 'health education', 'sex education', 'puberty education',
        'prevention', 'awareness', 'safety', 'health class'
    ];

    const hasEduContext = eduIndicators.some(indicator => normalized.includes(indicator));

    if (!hasEduContext) return false;

    // Check if matched keywords are in allowlist
    const allowlist = guardrailConfig.allowlist;
    for (const [_subject, terms] of Object.entries(allowlist)) {
        if (terms.some((term: string) => normalized.includes(term.toLowerCase()))) {
            return true;
        }
    }

    return false;
}

// Stage 1: Keyword-based guardrail check
export function checkMessage(text: string): GuardrailResult {
    const normalized = normalizeText(text);
    const matchedKeywords: string[] = [];
    let highestPriorityAction: 'ALLOW' | 'BLOCK' | 'SAFE_REDIRECT' | 'ESCALATE' = 'ALLOW';
    let matchedCategory = '';

    // Priority order: ESCALATE > BLOCK > SAFE_REDIRECT > ALLOW
    const actionPriority = { ESCALATE: 3, BLOCK: 2, SAFE_REDIRECT: 1, ALLOW: 0 };

    // Check each category
    for (const [category, config] of Object.entries(guardrailConfig.categories)) {
        const categoryConfig = config as any;
        const allKeywords = [
            ...(categoryConfig.keywords || []),
            ...(categoryConfig.variants || []),
            ...(categoryConfig.tamil || []),
            ...(categoryConfig.hindi || []),
            ...(categoryConfig.grooming || []),
            ...(categoryConfig.phrases || [])
        ];

        for (const keyword of allKeywords) {
            if (normalized.includes(keyword.toLowerCase())) {
                matchedKeywords.push(keyword);

                // Check if this is educational context and in allowlist
                if (isEducationalContext(text, category)) {
                    console.log(`Educational context detected for: ${keyword}`);
                    continue; // Skip blocking for educational use
                }

                // Update action if higher priority
                const currentPriority = actionPriority[categoryConfig.action as keyof typeof actionPriority];
                const highestPriority = actionPriority[highestPriorityAction];

                if (currentPriority > highestPriority) {
                    highestPriorityAction = categoryConfig.action;
                    matchedCategory = category;
                }
            }
        }
    }

    // If no matches, allow
    if (matchedKeywords.length === 0) {
        return { safe: true, action: 'ALLOW' };
    }

    // Get user-facing message
    const messageKey = `${highestPriorityAction}_${matchedCategory}`;
    const message = (guardrailConfig.messages as any)[messageKey] ||
        (guardrailConfig.messages as any)[highestPriorityAction] ||
        "I'm here to help with your studies. Let's keep our conversation educational!";

    return {
        safe: highestPriorityAction === 'ALLOW',
        action: highestPriorityAction,
        category: matchedCategory,
        message,
        matchedKeywords
    };
}

// Escalate high-risk incidents
export async function escalateIncident(incident: Incident): Promise<void> {
    // In a production system, this would:
    // 1. Save to Firestore chatIncidents collection
    // 2. Send email notification to admin
    // 3. Flag user account for review

    console.error('🚨 INCIDENT ESCALATED:', {
        category: incident.category,
        studentId: incident.studentId,
        timestamp: incident.timestamp,
        preview: incident.message.substring(0, 100)
    });

    // For now, just log to console
    // TODO: Implement Firestore save and email notification
}

// Check if response from AI should be blocked
export function checkAIResponse(response: string): GuardrailResult {
    // Check AI's response for any blocked content
    // This prevents AI from accidentally sharing harmful content
    return checkMessage(response);
}

// Validate educational intent (can be used for Stage 2 with Gemini)
export function needsIntentCheck(result: GuardrailResult): boolean {
    // If educational allowlist keywords detected, we need Gemini to verify intent
    return !!(result.action === 'BLOCK' && result.matchedKeywords &&
        result.matchedKeywords.length > 0 &&
        result.matchedKeywords.some(kw => {
            const allowlistTerms = Object.values(guardrailConfig.allowlist).flat();
            return allowlistTerms.some((term: string) => kw.toLowerCase().includes(term.toLowerCase()));
        }));
}
