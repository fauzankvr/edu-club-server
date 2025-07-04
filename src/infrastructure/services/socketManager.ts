export const userSocketMap = new Map<string, string>(); // userId -> socketId
export const socketUserMap = new Map<string, string>(); // socketId -> userId


export const registerUserSocket = (
  socketId: string,
  userId: string
): boolean => {
 
  userSocketMap.set(userId, socketId);
  socketUserMap.set(socketId, userId);
  return true;
};

export const unregisterUserSocket = (socketId: string) => {
  const userId = socketUserMap.get(socketId);
  if (userId) {
    userSocketMap.delete(userId);
    socketUserMap.delete(socketId);
  }
};

export const getSocketIdByUserId = (userId: string): string | undefined => {
  return userSocketMap.get(userId);
};

export const getUserIdBySocketId = (socketId: string): string | undefined => {
  return socketUserMap.get(socketId);
};
