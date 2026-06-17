async function deploy() {
  console.log('Triggering Coolify deployment via API...');
  
  const token = '1|cool_1244fb0ed5ea4703555f76bf718c2cd86d6780ac28e809edc3df7fd3dfcfe16d';
  const appUuid = 'jygt5ernjovbf36q391orfs2';
  const url = `https://coolifyone.orizongroup.online/api/v1/applications/${appUuid}`;
  
  // Ignore SSL certificate issues (matching curl's -k option)
  // In Node, we can disable SSL verification for this request:
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
