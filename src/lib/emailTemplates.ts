export const emailTemplates = {
  welcome: (data: { name: string }) => ({
    subject: 'Welcome to HookDrop!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Welcome to HookDrop, ${data.name}!</h2>
        <p>We're excited to have you join our community of music creators.</p>
        <p>Start exploring premium hooks or upload your own to start earning.</p>
        <a href="https://hookdrop.com/discover" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Explore Hooks</a>
      </div>
    `
  }),

  purchaseConfirmation: (data: { buyerName: string; hookTitle: string; amount: number; licenseType: string; downloadUrl: string }) => ({
    subject: 'Your HookDrop Purchase Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Purchase Confirmed!</h2>
        <p>Hi ${data.buyerName},</p>
        <p>Thank you for your purchase of <strong>${data.hookTitle}</strong>.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>License:</strong> ${data.licenseType}</p>
        </div>
        <a href="${data.downloadUrl}" style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Now</a>
      </div>
    `
  }),

  licenseDelivery: (data: { hookTitle: string; licenseKey: string; downloadUrl: string }) => ({
    subject: 'Your License Key - HookDrop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Your License Key</h2>
        <p>Hook: <strong>${data.hookTitle}</strong></p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>License Key:</strong> ${data.licenseKey}</p>
        </div>
        <a href="${data.downloadUrl}">Download Hook</a>
      </div>
    `
  }),

  sellerSale: (data: { hookTitle: string; amount: number; licenseType: string }) => ({
    subject: 'You made a sale on HookDrop!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Congratulations on your sale!</h2>
        <p>Your hook <strong>${data.hookTitle}</strong> was just purchased.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${data.amount}</p>
          <p><strong>License:</strong> ${data.licenseType}</p>
        </div>
      </div>
    `
  }),

  payoutProcessed: (data: { amount: number; status: string }) => ({
    subject: 'Payout Processed - HookDrop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Payout Processed</h2>
        <p>Your payout of <strong>$${data.amount}</strong> has been ${data.status}.</p>
        <p>Funds arrive in 2-7 business days.</p>
      </div>
    `
  }),

  reviewResponse: (data: { hookTitle: string; responseText: string }) => ({
    subject: 'Seller responded to your review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">New Response</h2>
        <p>The seller of <strong>${data.hookTitle}</strong> responded to your review.</p>
        <p style="background: #F3F4F6; padding: 15px; border-radius: 8px;">${data.responseText}</p>
      </div>
    `
  })
};
