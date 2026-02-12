# How to Whitelist a Client - WORKING METHOD

## The Simple Truth

The whitelist is stored in a **JSON file** (`public/premium-whitelist.json`). To add a client, you edit this file and deploy.

## Step-by-Step Guide

### 1. Get Client's Account Number
Ask your client: "What's your Deriv account number?"

They'll give you something like:
- `CR1234567` (Real account)
- `VRTC1234567` (Demo account)

### 2. Open the Whitelist File
Open `public/premium-whitelist.json` in your code editor

### 3. Add the Client
Add their account number to the array:

```json
{
  "premiumAccounts": [
    "CR5186289",
    "VRTC90460",
    "CR1234567"  ← Add your client's account here
  ],
  "lastUpdated": "2024-01-15T00:00:00Z"
}
```

### 4. Save and Deploy
```bash
git add public/premium-whitelist.json
git commit -m "feat: add premium access for CR1234567"
git push
```

### 5. Tell Your Client
Once deployed (usually takes 1-2 minutes), tell your client:

```
✅ You're whitelisted!

To access premium bots:
1. Go to [your website]
2. Log into Deriv with account CR1234567
3. Click on a premium bot
4. Enter password: 6776
5. Click "Unlock Bot"
```

## Example

**Client says:** "My account is CR9876543"

**You do:**
1. Open `public/premium-whitelist.json`
2. Add `"CR9876543"` to the array
3. Save file
4. Run: `git add . && git commit -m "feat: add CR9876543" && git push`
5. Wait for deployment
6. Tell client they're ready

## To Remove a Client

1. Open `public/premium-whitelist.json`
2. Remove their account number from the array
3. Save and deploy

## Troubleshooting

### Client says "Access denied" even after whitelisting:

**Check these things:**

1. **Is the account number correct?**
   - Must be EXACT match (case-sensitive)
   - Format: CR followed by numbers OR VRTC followed by numbers
   - No spaces, no typos

2. **Is the client logged into the correct Deriv account?**
   - They must be logged into the EXACT account you whitelisted
   - Ask them to check their account number in Deriv dashboard

3. **Has the deployment finished?**
   - Check your hosting platform (Vercel/Netlify)
   - Make sure the latest commit is deployed
   - Usually takes 1-2 minutes

4. **Did the client refresh the page?**
   - Tell them to hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Check browser console:**
   - Tell client to press F12
   - Go to Console tab
   - Look for messages about premium access
   - Should see: "Premium access check for CR1234567: ✅ GRANTED"

### Still not working?

Ask client to:
1. Open browser console (F12)
2. Try to access premium bot
3. Send you a screenshot of the console messages

You should see something like:
```
Premium access check for CR1234567: ✅ GRANTED
Whitelist: ["CR5186289", "VRTC90460", "CR1234567"]
```

If you see:
```
Premium access check for CR9999999: ❌ DENIED
Whitelist: ["CR5186289", "VRTC90460", "CR1234567"]
```

This means the client is logged into account CR9999999, but you whitelisted CR1234567. They need to log into the correct account!

## How It Works

```
1. Client clicks "Access" on premium bot
2. Client enters password: 6776
3. System checks: Is password correct? ✅
4. System fetches: /premium-whitelist.json
5. System checks: Is client's account in the list?
   - Gets account from localStorage: active_loginid
   - Compares with whitelist array
6. If BOTH password AND whitelist match → Bot loads
7. If password correct but NOT whitelisted → "Access denied"
```

## Important Notes

- ✅ Password is: **6776**
- ✅ Client needs BOTH password AND whitelist
- ✅ Account number must be EXACT match
- ✅ Client must be logged into the whitelisted account
- ✅ Changes take effect after deployment (1-2 minutes)
- ⚠️ No backend database needed - it's just a JSON file!

## Quick Reference

**File to edit:** `public/premium-whitelist.json`

**Format:**
```json
{
  "premiumAccounts": ["CR1234567", "VRTC9876543"],
  "lastUpdated": "2024-01-15T00:00:00Z"
}
```

**Deploy command:**
```bash
git add . && git commit -m "feat: add client" && git push
```

**Password for clients:** `6776`

That's it! Simple and it actually works. 😊
