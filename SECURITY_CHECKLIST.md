# HookDrop Security Checklist

## Pre-Launch Security Audit

### Authentication & Authorization

- [ ] **Row Level Security (RLS) enabled on all tables**
  - Verify policies exist for SELECT, INSERT, UPDATE, DELETE
  - Test policies with different user roles
  - Ensure no tables are publicly accessible without auth

- [ ] **Email verification required**
  - Users cannot access features until verified
  - Verification links expire after 24 hours
  - Rate limiting on verification email requests

- [ ] **Password security**
  - Minimum 8 characters enforced
  - Passwords hashed with bcrypt
  - Password reset tokens expire after 1 hour
  - Rate limiting on password reset requests

- [ ] **Session management**
  - JWT tokens expire appropriately (1 hour default)
  - Refresh tokens implemented and secure
  - Sessions invalidated on logout
  - No sensitive data stored in localStorage

### API Security

- [ ] **Supabase anon key properly scoped**
  - Only public read access allowed
  - Write operations require authentication
  - Service role key never exposed to frontend

- [ ] **Stripe keys secure**
  - Publishable key used on frontend only
  - Secret key stored in environment variables
  - Webhook secret validated on all webhook calls
  - No hardcoded API keys in code

- [ ] **Edge Functions secured**
  - Authentication required where needed
  - Input validation on all parameters
  - Rate limiting implemented
  - Error messages don't leak sensitive info

- [ ] **CORS configured correctly**
  - Only production domain allowed
  - No wildcard (*) origins in production
  - Credentials handled securely

### Data Protection

- [ ] **Sensitive data encrypted**
  - Payment info handled by Stripe (PCI compliant)
  - Personal data encrypted at rest
  - SSL/TLS for all data in transit

- [ ] **File upload security**
  - File type validation (audio files only)
  - File size limits enforced (50MB max)
  - Virus scanning on uploads (if applicable)
  - Secure file storage with access controls

- [ ] **SQL injection prevention**
  - Parameterized queries used throughout
  - No string concatenation in SQL
  - Supabase client handles escaping

- [ ] **XSS prevention**
  - User input sanitized before display
  - React's built-in XSS protection utilized
  - No dangerouslySetInnerHTML without sanitization
  - Content Security Policy headers set

### Payment Security

- [ ] **Stripe integration secure**
  - Stripe Elements used for card input
  - No card data touches your servers
  - Webhook signatures verified
  - Idempotency keys used for critical operations

- [ ] **Payout security**
  - Stripe Connect properly configured
  - Identity verification required for sellers
  - Payout holds for fraud prevention
  - Transaction monitoring enabled

- [ ] **Refund process secure**
  - Refunds only by authorized users
  - Audit log of all refunds
  - Fraud detection for chargeback abuse

### Privacy Compliance

- [ ] **GDPR compliance**
  - Privacy policy accessible
  - Cookie consent implemented
  - Data export functionality
  - Right to deletion implemented

- [ ] **Data retention policies**
  - Inactive accounts deleted after 2 years
  - Deleted data actually removed
  - Backup retention policy defined
  - Audit logs maintained

- [ ] **User consent tracked**
  - Marketing emails require opt-in
  - Terms acceptance recorded
  - Privacy policy acceptance logged

### Infrastructure Security

- [ ] **Environment variables secure**
  - No secrets in version control
  - .env files in .gitignore
  - Production secrets rotated regularly
  - Different keys for dev/staging/prod

- [ ] **Database security**
  - Supabase project has strong password
  - Database backups enabled
  - Point-in-time recovery configured
  - Access logs monitored

- [ ] **Hosting security**
  - HTTPS enforced (no HTTP)
  - Security headers configured:
    - X-Frame-Options: DENY
    - X-Content-Type-Options: nosniff
    - Strict-Transport-Security
    - Content-Security-Policy
  - DDoS protection enabled

### Monitoring & Logging

- [ ] **Error tracking configured**
  - Sentry or similar tool integrated
  - Errors logged without sensitive data
  - Alert thresholds set
  - Team notified of critical errors

- [ ] **Audit logging**
  - All financial transactions logged
  - User actions tracked (login, purchase, upload)
  - Admin actions audited
  - Logs retained for 90 days minimum

- [ ] **Suspicious activity monitoring**
  - Failed login attempts tracked
  - Unusual purchase patterns flagged
  - Multiple account creation from same IP
  - Rapid API requests rate limited

### Third-Party Security

- [ ] **Dependencies up to date**
  - npm audit run and issues resolved
  - Automated dependency updates configured
  - Only trusted packages used
  - Package-lock.json committed

- [ ] **Third-party services vetted**
  - Stripe: PCI DSS Level 1 certified
  - Supabase: SOC 2 Type II compliant
  - Email provider: GDPR compliant

### Testing

- [ ] **Security testing completed**
  - Penetration testing performed
  - SQL injection tests passed
  - XSS vulnerability tests passed
  - CSRF protection verified
  - Authentication bypass attempts failed

- [ ] **User role testing**
  - Regular users cannot access admin features
  - Sellers cannot modify other sellers' content
  - Buyers cannot access unpurchased content
  - Unauthenticated users properly restricted

### Incident Response

- [ ] **Incident response plan documented**
  - Contact list for security incidents
  - Steps for different breach scenarios
  - Communication templates prepared
  - Legal team contact info available

- [ ] **Backup & recovery tested**
  - Database restore tested successfully
  - Recovery time objective (RTO) defined
  - Recovery point objective (RPO) defined
  - Disaster recovery plan documented

### Compliance

- [ ] **Legal pages accessible**
  - Terms of Service: /terms
  - Privacy Policy: /privacy
  - Refund Policy: /refunds
  - All pages reviewed by legal counsel

- [ ] **Required disclosures**
  - Payment processor disclosed (Stripe)
  - Data storage location disclosed
  - Cookie usage disclosed
  - Third-party services listed

---

## Post-Launch Security Maintenance

### Weekly
- Review error logs for unusual patterns
- Check failed login attempts
- Monitor webhook delivery failures
- Review new user signups for fraud

### Monthly
- Update dependencies (npm update)
- Review and rotate API keys if needed
- Audit user permissions and roles
- Check SSL certificate expiration
- Review Stripe dashboard for disputes

### Quarterly
- Full security audit
- Penetration testing
- Review and update security policies
- Team security training
- Backup restore test

### Annually
- Legal review of terms and policies
- Comprehensive third-party security audit
- Disaster recovery drill
- Security certification renewal (if applicable)

---

## Security Contacts

**Report Security Issues:**
- Email: security@hookdrop.com
- Response time: 24 hours for critical issues
- PGP key available for sensitive reports

**Emergency Contacts:**
- Technical Lead: [Phone/Email]
- Legal Counsel: [Phone/Email]
- Stripe Support: https://support.stripe.com
- Supabase Support: support@supabase.io

---

## Security Best Practices for Team

### For Developers
- Never commit secrets to git
- Use environment variables for all config
- Review code for security issues before merge
- Keep dependencies updated
- Follow principle of least privilege
- Enable 2FA on all accounts

### For Admins
- Use strong, unique passwords
- Enable 2FA on all admin accounts
- Limit admin access to necessary personnel
- Audit admin actions regularly
- Never share admin credentials
- Use VPN for sensitive operations

### For Support Team
- Verify user identity before account changes
- Never ask users for passwords
- Report suspicious user behavior
- Follow data privacy guidelines
- Escalate security concerns immediately

---

**Security is everyone's responsibility. When in doubt, ask!**
