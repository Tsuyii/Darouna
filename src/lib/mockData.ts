// Mock data for UI preview — controlled by VITE_MOCK_DATA=true
// To remove: vercel env rm VITE_MOCK_DATA production && git push

export const MOCK = import.meta.env.VITE_MOCK_DATA?.trim() === 'true'

export const mockSyndic = {
  building: { id: 'mock-1', name: 'Résidence Al-Andalus' },
  stats: { totalUnits: 24, occupancy: 87, revenue: 72000, openTasks: 5 },
  tasks: [
    { id: 't1', title: 'Fix lobby lighting', status: 'in_progress' as const, priority: 'high', createdAt: '2026-03-28T09:00:00Z' },
    { id: 't2', title: 'Elevator inspection',  status: 'pending' as const,     priority: 'high', createdAt: '2026-03-30T11:00:00Z' },
    { id: 't3', title: 'Repaint stairwell B',  status: 'approved' as const,    priority: 'low',  createdAt: '2026-03-25T08:00:00Z' },
  ],
}

export const mockResident = {
  charges: [
    { id: 'c1', amount: 2400, dueDate: '2026-04-15T00:00:00Z', status: 'pending' as const },
    { id: 'c2', amount: 1200, dueDate: '2026-03-15T00:00:00Z', status: 'overdue' as const },
  ],
  announcements: [
    {
      id: 'a1',
      title: 'Water shutoff – Saturday 8h–12h',
      content: 'Scheduled maintenance on the main water supply. Please store water in advance.',
      type: 'urgent',
      createdAt: '2026-03-31T07:00:00Z',
    },
    {
      id: 'a2',
      title: 'Residents meeting – April 10th',
      content: 'Annual co-ownership meeting in the ground floor hall at 18:00. All owners invited.',
      type: 'event',
      createdAt: '2026-03-29T10:00:00Z',
    },
    {
      id: 'a3',
      title: 'New intercom system installed',
      content: 'The new digital intercom is now active. Contact reception to register your phone number.',
      type: 'info',
      createdAt: '2026-03-27T14:00:00Z',
    },
  ],
}

export const mockGardien = {
  stats: { total: 8, pending: 3, inProgress: 2, completed: 3 },
  tasks: [
    {
      id: 'g1',
      title: 'Fix lobby lighting',
      description: 'Two ceiling fixtures in the main lobby are out. Replace bulbs and check wiring.',
      status: 'in_progress' as const,
      scheduledAt: '2026-04-02T09:00:00Z',
      createdAt: '2026-04-01T08:00:00Z',
    },
    {
      id: 'g2',
      title: 'Elevator inspection',
      description: 'Monthly safety inspection of Elevator A. Check cables, doors, and emergency button.',
      status: 'pending' as const,
      scheduledAt: '2026-04-02T14:00:00Z',
      createdAt: '2026-04-01T09:00:00Z',
    },
    {
      id: 'g3',
      title: 'Clean rooftop terrace',
      description: 'Sweep and clear the rooftop terrace ahead of the residents meeting on April 10.',
      status: 'approved' as const,
      scheduledAt: undefined,
      createdAt: '2026-03-30T10:00:00Z',
    },
  ],
}
