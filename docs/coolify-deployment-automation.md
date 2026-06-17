# Coolify Automated Deployment Guide

This document explains how to trigger Coolify application redeployments programmatically via the Coolify REST API, bypassing the web UI. This allows automated E2E testing or deployment scripts to update the live docker containers immediately after git commits are pushed.

---

## 1. Coolify API Credentials

These credentials are used to authenticate requests to the Coolify instance on this VPS:
* **API Base URL**: `https://coolifyone.orizongroup.online`
* **API Token**: `cool_1244fb0ed5ea4703555f76bf718c2cd86d6780ac28e809edc3df7fd3dfcfe16d`
* **Authorization Header**: `Bearer 1|cool_1244fb0ed5ea4703555f76bf718c2cd86d6780ac28e809edc3df7fd3dfcfe16d`

---

## 2. Application Lookups

You can find the list of deployed apps and their UUIDs by querying the Coolify PostgreSQL database locally on the host:
```bash
sudo docker exec -i coolify-db psql -U coolify -d coolify -c "select id, uuid, name, fqdn, git_repository from applications;"
```

Our current application UUID:
* **App Name**: `image-ads-generator` (Static Image Ads Generator)
* **UUID**: `jygt5ernjovbf36q391orfs2`
* **Live Domain**: `https://superads.orizongroup.online` (Port `3001` internally)

---

## 3. Automation Script (`scripts/deploy-app.ts`)

To trigger a deployment programmatically without using curl (which may require terminal permissions), we write a lightweight Node.js/TypeScript script that runs via `tsx`:

```typescript
async function deploy() {
  console.log('Triggering Coolify deployment via API...');
  
  const token = '1|cool_1244fb0ed5ea4703555f76bf718c2cd86d6780ac28e809edc3df7fd3dfcfe16d';
  const appUuid = 'jygt5ernjovbf36q391orfs2';
  const url = `https://coolifyone.orizongroup.online/api/v1/applications/${appUuid}`;
  
  // Disable SSL check for the self-signed/local certificate on the panel
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instant_deploy: true,
      }),
    });
    
    console.log('Response Status:', response.status);
    const text = await response.text();
    console.log('Response Body:', text);
    
    if (response.ok) {
      console.log('Deployment triggered successfully!');
    } else {
      console.error('Failed to trigger deployment:', response.statusText);
    }
  } catch (error) {
    console.error('Error triggering deployment:', error);
  }
}

deploy();
```

To run this script:
```bash
npx tsx scripts/deploy-app.ts
```

---

## 4. Deploying Other Applications
You can reuse this setup for any app in Coolify:
1. Lookup the target application UUID in the database.
2. Replace the `appUuid` in the script.
3. Execute `npx tsx scripts/deploy-app.ts` to trigger a clean container pull and rebuild.
