export const sendSms = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`[SMS Service] Sending to ${phoneNumber}: ${message}`);
  // Simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};