import fs from 'fs';

async function test() {
  const res = await fetch('https://api.heurist.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 0xfe1d07f523ed7a45417ec38bd78515828956c8ae-55425ba524627cc'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3-70b-instruct', // or some other model, let's try a common one or just see if it works
      messages: [{ role: 'user', content: 'Hello' }]
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
