# Enable Gothos Labs enquiry emails

The Talk to us form and Hoot's confirmed demo requests now call `/api/enquiry`. The destination is fixed in `enquiry-api.mjs` as `therealgautam2004@gmail.com`. A successful response means Resend accepted the message for delivery; check the inbox to confirm arrival. No booking is made by submitting an enquiry.

## Your setup steps

1. Sign in to [Resend](https://resend.com/). Its [domain guide](https://resend.com/docs/add-a-domain) explains the sender setup. In Resend **Domains → Add Domain**, enter a sending subdomain you control, such as `mail.gothoslabs.com`. The example is only a suggestion; use the exact subdomain you choose in the later `from` setting.
2. Resend shows DNS records on the new domain's **Records** tab. Open the DNS manager for `gothoslabs.com` and copy each record's type, name, and value exactly as shown. Follow the records Resend displays for your domain; do not guess their values. Keep the website's existing A/CNAME records intact. Return to Resend and wait for the sending domain to show **Verified**. DNS changes can take time to propagate.
3. In Resend **API Keys → Create API Key**, create one called `Gothos Labs enquiries`. Choose **Sending access** and, if offered, restrict it to the verified sending domain. Copy the key when shown; Resend displays it only once. Keep it private.
4. For **local testing**, open the Git-ignored `enquiry.config.local.json` in this repository. Set `apiKey` to the Resend key and `from` to a sender at the verified domain. Example (replace the address with your actual verified domain):

   ```json
   {
     "apiKey": "YOUR_RESEND_KEY",
     "from": "Gothos Labs <enquiries@mail.gothoslabs.com>"
   }
   ```

   Save the file, start the site with `npm.cmd run dev`, and submit a small test enquiry at `http://127.0.0.1:4177/#contact`. This local server needs no package installation. Do not put the key in a tracked file or in chat.
5. For **Vercel**, open the Gothos Labs project in the Vercel dashboard. Under **Settings → Environment Variables**, create `ENQUIRY_CONFIG_JSON`. Its value is the same single-line JSON object containing `apiKey` and `from`. Apply it to the environments where the site should send email (Production and, if you will test a preview deployment, Preview). Save it and redeploy so the function receives the new variable. The local config file is not deployed.
6. On the updated site, submit one synthetic enquiry from the Talk to us form. Check the displayed result, Resend's email activity, and the Gmail inbox at `therealgautam2004@gmail.com`, including Spam. Reply to the message and confirm it addresses the test visitor's email. Also test a demo enquiry through Hoot; it asks for an explicit yes before sending.

## If a test fails

- **Email delivery is not configured yet:** `apiKey` or `from` is empty in the active configuration, or Vercel has not been redeployed after setting `ENQUIRY_CONFIG_JSON`.
- **The enquiry could not be sent:** check that the sending domain is Verified, the From address belongs to it, the key has Sending access, and the Resend email activity shows the request. The site deliberately does not show provider error details to visitors.
- **Accepted on the site but not in Gmail:** check Resend delivery status and Gmail Spam. Acceptance by the API does not guarantee inbox delivery.
- **Too many enquiries:** wait an hour; the endpoint limits submissions from one address within a running server instance. The Resend idempotency key prevents accidental duplicate sending on a retry for 24 hours.

The endpoint sends plain text with the name, email, topic, message, timestamp, and reference ID. It sets Reply-To to the visitor's email. The form keeps entered content if the service rejects the request. The endpoint validates fields, uses a hidden spam field, and applies a basic rate limit. These controls are useful for launch, but the in-memory rate limit is per server instance; if the public form attracts abuse, add an external bot challenge or durable rate limit.
