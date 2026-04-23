import { NextRequest, NextResponse } from "next/server";
import { geminiJSON } from "@/lib/gemini";
import { ChatMessage, StructuredFilters, ScoredApartment, ChatAction } from "@/lib/types";

export const maxDuration = 30;

interface ChatRequest {
  userMessage: string;
  history: ChatMessage[];
  currentFilters: StructuredFilters;
  currentFreeText: string;
  visibleApartments: { id: string; title: string; price: number | null; rooms: number | null; neighborhood: string | null; city: string | null }[];
}

interface GeminiChatResponse {
  reply: string;
  actions: ChatAction[];
}

const SYSTEM_PROMPT = `אתה עוזר אישי לחיפוש דירות להשכרה בישראל. אתה מדבר עברית, קצר ולעניין.

יש לך גישה לפעולות הבאות. כדי לבצע פעולה, החזר אותה במערך "actions":

1. עדכון פילטרים:
   { "type": "updateFilters", "filters": { "city": "תל אביב", "rooms_min": 3, "rooms_max": 4, "price_max": 9000, "neighborhoods": ["צפון ישן"], "must_have": ["חניה"] } }

2. הפעלת חיפוש מחודש:
   { "type": "runSearch" }

3. הסתרת דירה ספציפית:
   { "type": "hideApartment", "aptId": "<apt-id>" }

4. הסתרת כמה דירות:
   { "type": "hideMany", "aptIds": ["<id1>", "<id2>"] }

5. ביטול כל ההסתרות:
   { "type": "clearHidden" }

כללים:
- אם המשתמש מבקש שינוי בפילטרים ("תעשה מינימום 3 חדרים"), עדכן פילטרים וגם הפעל חיפוש מחודש.
- אם המשתמש מבקש להסיר דירה או "תמחק את X ברחוב Y", מצא את ה-id המתאים מהרשימה הנראית וצור hideApartment.
- אם המשתמש רק שואל שאלה, ענה בלי פעולות.
- "reply" חייב להיות קצר (1-3 משפטים).
- אל תמציא ids של דירות שלא ברשימה הנראית.
- אל תשנה פילטרים שלא נתבקשת.

פורמט החזרה — JSON בלבד:
{ "reply": "טקסט קצר בעברית", "actions": [...] }`;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { userMessage, history, currentFilters, currentFreeText, visibleApartments } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: "userMessage required" }, { status: 400 });
    }

    // Build compact context for the model
    const recentHistory = history.slice(-8).map((m) => `${m.role === "user" ? "משתמש" : "עוזר"}: ${m.text}`).join("\n");
    const aptList = visibleApartments.slice(0, 20).map((a) =>
      `- id=${a.id} | ${a.title} | ${[a.neighborhood, a.city].filter(Boolean).join(", ")} | ${a.price ? a.price + "₪" : "—"} | ${a.rooms || "—"} חדרים`
    ).join("\n");

    const prompt = `
החיפוש הנוכחי:
- תיאור חופשי: ${currentFreeText || "(ריק)"}
- פילטרים מובנים: ${JSON.stringify(currentFilters)}

דירות גלויות עכשיו (עד 20):
${aptList || "(אין)"}

היסטוריית שיחה אחרונה:
${recentHistory || "(אין)"}

הודעת המשתמש החדשה:
${userMessage}

ענה ב-JSON תקין בלבד.`;

    let parsed: GeminiChatResponse;
    try {
      parsed = await geminiJSON<GeminiChatResponse>(prompt, SYSTEM_PROMPT);
    } catch (e: any) {
      return NextResponse.json({
        reply: "סליחה, המודל עמוס כרגע. נסה שוב בעוד רגע.",
        actions: [],
      });
    }

    // Sanitize actions
    const safeActions: ChatAction[] = Array.isArray(parsed.actions)
      ? parsed.actions.filter((a) => a && typeof (a as any).type === "string")
      : [];

    return NextResponse.json({
      reply: parsed.reply?.trim() || "בוצע.",
      actions: safeActions,
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
