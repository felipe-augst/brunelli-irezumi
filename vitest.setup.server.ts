import { vi } from 'vitest'

// 'server-only' lança erro fora do bundle do Next; o stub vale só neste projeto
vi.mock('server-only', () => ({}))
