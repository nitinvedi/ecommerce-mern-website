# Email Configuration for .env

Add these to your backend/.env file:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Note: For Gmail, you need to:
# 1. Enable 2-factor authentication
# 2. Generate an "App Password" at https://myaccount.google.com/apppasswords
# 3. Use the app password (not your regular password)
```

## Alternative Email Services

### SendGrid
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Mailgun
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
```

### For Development (Mailtrap)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

## Testing Without Email

If you don't want to set up email right now, the system will work fine - emails just won't be sent. The in-app notifications will still work perfectly!
