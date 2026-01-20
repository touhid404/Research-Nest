# Research Nest - AI Meeting Summary

This feature provides AI-generated summaries, action items, and decision logs from meeting chats or raw text logs.

## Configuration

1.  **Environment Variables**:
    Add the following to your `backend/.env` file:
    ```bash
    OPENAI_API_KEY=your-openai-api-key-here
    AI_RISKY_UPLOAD=deny  # Set to 'allow' if you trust the provider with potentially sensitive file uploads
    ```

2.  **Providers**:
    Currently configured to use `openai` in `backend/src/lib/llmClient.js`. 
    If `OPENAI_API_KEY` is missing, it falls back to a **Mock Mode** for testing without costs.

## API Endpoint

**POST** `/api/ai/meeting-summary`

**Body**:
```json
{
  "sourceType": "chat", // "chat", "text", or "yjs"
  "content": "conversation_id_here_OR_raw_text",
  "metadata": {
      "timestampStart": "2024-01-01T10:00:00Z"
  }
}
```

**Example Curl**:
```bash
curl -X POST http://localhost:5000/api/ai/meeting-summary \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "text",
    "content": "Meeting Log:\nUser A: We need to update the UI.\nUser B: Agreed. I will take care of the Navbar by Friday."
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": ["Users discussed UI updates."],
    "actionItems": [
      { "who": "User B", "action": "Update Navbar", "due": "Friday" }
    ],
    "decisions": ["UI update approved."]
  }
}
```

## Frontend
The summary feature is accessible via the "Magic Wand" icon in the Chat Header.
- It can summarize the current active conversation (if chat history exists).
- You can also upload a text file to summarize.
