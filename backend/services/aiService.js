import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateInvoiceDescription = async (items) => {
  try {
    const itemList = items
      .map((item) => `${item.description} (qty: ${item.quantity}, price: ₹${item.price})`)
      .join(', ');

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: `Write a short professional invoice description for these services: ${itemList}. Keep it under 3 sentences.`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI description failed: ${error.message}`);
  }
};

export const generatePaymentReminder = async (invoice, client, daysPastDue) => {
  try {
    const tone =
      daysPastDue <= 3 ? 'gentle and polite' :
      daysPastDue <= 10 ? 'firm and professional' :
      'urgent and serious';

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: `Write a ${tone} payment reminder email for:
          Client: ${client.name}
          Invoice Number: ${invoice.invoiceNumber}
          Amount Due: ₹${invoice.totalAmount}
          Days Past Due: ${daysPastDue}
          Keep it under 5 sentences. Be ${tone}.`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI reminder failed: ${error.message}`);
  }
};

export const generateFinancialInsights = async (invoices) => {
  try {
    const total = invoices.length;
    const paid = invoices.filter((inv) => inv.status === 'paid').length;
    const overdue = invoices.filter((inv) => inv.status === 'overdue').length;
    const pending = invoices.filter((inv) => inv.status === 'pending').length;
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: `As a financial advisor, analyze this freelancer's invoice data and give 3 actionable insights:
          Total invoices: ${total}
          Paid: ${paid}
          Overdue: ${overdue}
          Pending: ${pending}
          Total Revenue collected: ₹${totalRevenue}
          Give practical advice in bullet points. Keep it concise.`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error(`AI insights failed: ${error.message}`);
  }
};