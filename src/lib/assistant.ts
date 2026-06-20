import api from './api'

// The assistant always talks to the real backend (it needs DeepSeek + live data),
// regardless of the VITE_MOCK_DATA flag used elsewhere in the app.

export interface SuggestedAction {
  route: string
  label: string
}

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedAction?: SuggestedAction
  createdAt?: string
}

interface ChatResponse {
  reply: string
  suggestedAction: SuggestedAction | null
}

export const assistantApi = {
  async send(message: string): Promise<ChatResponse> {
    const res = await api.post('/api/v1/assistant/chat', { message })
    return res.data.data
  },

  async history(): Promise<AssistantMessage[]> {
    const res = await api.get('/api/v1/assistant/history')
    return res.data.data.messages ?? []
  },

  async clear(): Promise<void> {
    await api.delete('/api/v1/assistant/history')
  },
}
