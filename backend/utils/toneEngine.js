export const getTone = (daysPastDue) => {
  if (daysPastDue <= 0) return 'gentle';
  if (daysPastDue <= 3) return 'gentle';
  if (daysPastDue <= 10) return 'firm';
  return 'final';
};

export const getToneMessage = (tone) => {
  const messages = {
    gentle: 'Friendly reminder — your payment is due soon.',
    firm: 'Your payment is overdue. Please settle at your earliest convenience.',
    final: 'Final notice — immediate payment required to avoid further action.',
  };
  return messages[tone];
};