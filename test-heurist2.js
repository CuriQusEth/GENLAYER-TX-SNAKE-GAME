import fs from 'fs';

async function test(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0xfe1d07f523ed7a45417ec38bd78515828956c8ae-55425ba524627cc'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-70b-instruct',
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });
    console.log(url, res.status);
    console.log(await res.text());
  } catch (e) {
    console.log(url, e.message);
  }
}

test('https://api.heurist.xyz/v1/chat/completions');
test('https://llm-gateway.heurist.xyz/v1/chat/completions');
