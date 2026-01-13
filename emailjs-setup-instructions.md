# EmailJS Setup Instructions

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. **Copy the Service ID** - you'll need this

## Step 3: Create Email Template

1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Use this template content:

### Template Subject:
```
New Contact Form Submission from {{from_name}}
```

### Template Body:
```
New contact form submission from VireonixTech website:

From: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Company: {{company}}

Service Interested In: {{service}}
Project Budget: {{budget}}

Message:
{{message}}

---
This message was sent from the VireonixTech contact form.
Reply directly to this email to respond to {{from_name}}.
```

4. **Copy the Template ID** - you'll need this

## Step 4: Get Public Key

1. Go to **Account** → **General**
2. Find your **Public Key**
3. **Copy the Public Key** - you'll need this

## Step 5: Update Website Code

Replace these placeholders in the Contact.astro file:

```javascript
const EMAIL_CONFIG = {
  serviceID: 'YOUR_SERVICE_ID',     // Replace with your Service ID
  templateID: 'YOUR_TEMPLATE_ID',   // Replace with your Template ID
  publicKey: 'YOUR_PUBLIC_KEY'      // Replace with your Public Key
};
```

## Step 6: Configure Domain Restrictions (Recommended)

1. In EmailJS dashboard, go to **Account** → **General**
2. Under **Allowed Origins**, add your domain:
   - `https://vireonixtech-premium-9qwt.bolt.host`
   - Add any other domains you'll use

## Step 7: Test the Form

1. Fill out the contact form on your website
2. Submit the form
3. Check your email for the message
4. Verify the form shows success message

## Troubleshooting

### Common Issues:

1. **"EmailJS not configured" error**
   - Make sure you've replaced all placeholder values
   - Check that Service ID, Template ID, and Public Key are correct

2. **"Template not found" error**
   - Verify Template ID is correct
   - Make sure template is published/active

3. **"Service not found" error**
   - Verify Service ID is correct
   - Make sure email service is properly connected

4. **Rate limit errors**
   - Free plan allows 200 emails/month
   - Upgrade plan if needed

### Testing Tips:

- Use browser developer tools to check for JavaScript errors
- Test with different email addresses
- Check spam folder if emails aren't arriving
- Verify all form fields are working

## Security Notes

- Public key is safe to expose in client-side code
- Domain restrictions help prevent abuse
- Monitor usage in EmailJS dashboard
- Consider upgrading to paid plan for production use

## Free Plan Limits

- 200 emails per month
- EmailJS branding in emails
- Basic support

## Paid Plans Start at $15/month

- Up to 1,000 emails per month
- Remove EmailJS branding
- Priority support
- Advanced features