async function getReceipt() {
  const res = await fetch('https://studio.genlayer.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: ['0x186409d8e64434d7fd7a8259836f51ab6447074e8a9c50c428e3294b8d15acfa'],
      id: 1
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

getReceipt();
