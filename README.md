1. The Target (A Secret "Bot" Page)
Normally, if you try to fetch a modern website (like a React app), you just get an empty HTML shell because the page hasn't loaded its JavaScript yet. To get around this, the code specifically targets a special URL: https://genjutsu-social.vercel.app/api/bot-render. This is a page built for search engine bots that already has all the posts fully written out in plain HTML.

2. The "Middlemen" (CORS Proxies)
Browsers have a security rule called CORS that stops your website from secretly reading data from another website. To bypass this, the code uses three free "CORS Proxies" (allorigins.win, corsproxy.io, and codetabs.com). It basically asks these proxy servers, "Hey, can you go to Genjutsu, grab the HTML for me, and bring it back?"

3. The Race (Promise.any)
Free proxies can be slow or sometimes go offline. Instead of trying them one by one, the code uses a JavaScript feature called Promise.any(). It fires off a request to all three proxies at the exact same time. It's literally a race! Whichever proxy brings back valid HTML first is the winner, and the code immediately uses that data and ignores the others.

4. The Scraping (Reading the Data)
Once the winning proxy returns a giant wall of HTML text, the code uses DOMParser() to turn that text into a hidden, readable webpage in the background. It then acts like a scraper:

It looks for every list item (<li>).

It grabs the first paragraph (<p>) to extract the user's Display Name and @handle.

It grabs the rest of the paragraphs for the actual message.

It finds the link (<a>) to figure out the post's unique URL.
