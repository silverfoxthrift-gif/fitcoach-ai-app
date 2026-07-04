# Running Coach Rey

Your live site: **https://fitcoach-ai-app-silverfoxthrift.vercel.app**

## How this works (the 10-second version)

The website is always deployed on Vercel, but it can only *answer* when the
"engine" on your PC is running. That engine is two small programs:

- **n8n** — receives each message, calls Claude, sends back the reply.
- **ngrok** — a permanent public doorway from the internet to n8n on your PC.

So the rule is simple:

> **Engine running on your PC → the site works. Engine off → the site loads but
> can't reply.** The site is live only while your PC is awake and the engine is up.

That's the trade-off we chose (keeping n8n on your laptop). Nothing else needs
touching — the address never changes, so Vercel is configured once and for good.

## To bring the site ONLINE

1. Open the `apps/fitness-coach` folder.
2. **Double-click `Start Coach Rey.cmd`.**
3. Wait until it prints **"Coach Rey is LIVE"** (first launch can take a minute
   while n8n starts).
4. Open **https://fitcoach-ai-app-silverfoxthrift.vercel.app** — done.

Two windows will open (n8n and ngrok). Leave them running.

## To take the site OFFLINE

Close the two windows that opened (n8n and ngrok). The website will still load,
but it will say it can't reach the coach until you start the engine again.

## If the site says "I couldn't reach the coaching engine"

Almost always one of these:

- The engine isn't running → double-click `Start Coach Rey.cmd` again.
- Your PC went to sleep → wake it, then re-run the launcher.
- Closed a window by accident → re-run the launcher (it's safe to run anytime;
  it skips anything already running).

## One-time setup (already done — here for reference)

1. Free **ngrok** account → authtoken saved on this PC
   (`ngrok config add-authtoken ...`, stored in `%LOCALAPPDATA%\ngrok\ngrok.yml`).
2. Reserved the free static domain **`small-dugout-otter.ngrok-free.dev`**.
3. `ngrok.exe` placed at `%USERPROFILE%\ngrok\ngrok.exe`.
4. Vercel env var **`N8N_WEBHOOK_URL`** set to
   `https://small-dugout-otter.ngrok-free.dev/webhook/fitness-coach-chat`.

Because the domain is reserved, none of this ever needs redoing — restarting the
tunnel always gives the same address.

## Want it online 24/7 (even with the laptop closed)?

That's a small, separate change: have the website call Claude directly instead of
routing through n8n on your PC. Ask for it whenever you're ready — it's a clean
follow-up, not a rebuild.
