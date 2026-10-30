const sendEmail = async ({ to, subject, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo email service is not configured.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",

    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      sender: {
        name: "Piyush Kumar",
        email: senderEmail,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,
      textContent: text,

      replyTo: {
        email: senderEmail,
        name: "Piyush Kumar",
      },
    }),

    signal: AbortSignal.timeout(15000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Brevo API error:", {
      status: response.status,
      code: data.code,
      message: data.message,
    });

    throw new Error("Email delivery service rejected the request.");
  }

  if (!data.messageId) {
    throw new Error("Brevo did not return an email message ID.");
  }

  return {
    messageId: data.messageId,
  };
};

export default sendEmail;
