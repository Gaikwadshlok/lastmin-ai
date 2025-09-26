export const getEnv = () => ({
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

export type Env = ReturnType<typeof getEnv>;
export const env = getEnv();
