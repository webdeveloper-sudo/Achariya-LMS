import client from "./axiosInstance";

export const loginWithGoogle = async (token: string) => {
  const response = await client.post("/auth/google/login", { token });
  return response.data;
};

export const getMe = async () => {
  const response = await client.get("/auth/me");
  return response.data;
};
