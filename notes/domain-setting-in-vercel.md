**Here's a clear, step-by-step guide** to connect your own domain (apex/root domain like `example.com`) or subdomain (like `blog.example.com` or `www.example.com`) to a Vercel project.

This works the same way whether you bought the domain from Vercel or any other registrar (Namecheap, GoDaddy, Google Domains, Cloudflare, etc.). Vercel handles SSL certificates automatically once the DNS is configured correctly.

### Prerequisites
- You have a project deployed on Vercel (with a `.vercel.app` URL).
- You own a domain (or can buy one).
- You have access to your domain registrar’s DNS settings.

### Step 1: Go to your project’s Domains settings
1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the **project** you want to connect the domain to.
3. In the left sidebar, click **Settings** → **Domains**.

### Step 2: Add your domain or subdomain
1. Click the **Add Domain** button.
2. Type your domain exactly:
   - For a root/apex domain → `example.com`
   - For a subdomain → `blog.example.com` or `www.example.com`
3. Click **Add**.

   Vercel will immediately show you the **required DNS records** you need to add at your registrar.

### Step 3: Configure DNS records at your domain registrar
Vercel shows you exactly what to do. There are two common cases:

| Domain Type       | What to add at your registrar                          | Example record |
|-------------------|--------------------------------------------------------|----------------|
| **Apex / Root** (`example.com`) | An **A record** pointing to Vercel’s IP | `@` → `76.76.21.21` (or the exact IP Vercel shows) |
| **Subdomain** (`www.example.com` or `blog.example.com`) | A **CNAME record** | `www` → `cname.vercel-dns-xxx.com` (the exact value Vercel gives you) |

**Recommended setup (best practice):**
- Add **both** `example.com` **and** `www.example.com`.
- When you add the apex domain, Vercel usually prompts you to also add the `www` version and set up a redirect (e.g. `www.example.com` → `example.com` or vice versa). This is the cleanest setup.

**Alternative (easier for advanced users or wildcards):**
- Switch your domain’s nameservers to Vercel’s nameservers (shown in the dashboard). This is required for wildcard domains (`*.example.com`).

### Step 4: Wait for DNS propagation & verification
- Go back to the Domains page in Vercel.
- Vercel will automatically check your DNS every few minutes.
- Status will change from **Invalid Configuration** → **Valid Configuration** (this usually takes 1–5 minutes, but can take up to 48 hours in rare cases).
- Once verified, Vercel will issue a free SSL certificate automatically (you’ll see “SSL: Active”).

### Step 5: Test it
- Visit your domain (`https://example.com` or `https://blog.example.com`).
- It should now load your Vercel deployment.
- You can also run this in your terminal (optional):
  ```bash
  vercel domains inspect example.com
  ```

### Bonus: Common scenarios

**Want a subdomain pointing to a different project?**  
Just repeat Steps 1–4 on the second project and add e.g. `api.example.com` or `app.example.com`.

**Want wildcard subdomains (anything.example.com)?**  
Add `*.example.com` in Step 2 → Vercel will force you to use nameserver delegation.

**Using CLI instead of the dashboard?** (optional)
```bash
vercel domains add example.com          # add domain
vercel domains inspect example.com      # see required DNS
```

That’s it! After these steps your custom domain or subdomain will be live on Vercel.

If you run into any specific error (screenshot the “Invalid Configuration” message), drop it here and I’ll help you fix it instantly.