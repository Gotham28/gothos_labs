# Search discovery and Search Console

These steps follow review and separately authorized publication. Local checks cannot establish whether Google has indexed or ranked the live site. Crawling fetches pages, indexing stores eligible content, and ranking determines which indexed results appear for a query. None of the changes guarantees indexing or first place.

## Developer setup

1. Open [Google Search Console](https://search.google.com/search-console), add a **Domain** property and enter `gothoslabs.com` (no scheme or path). If already verified, use the existing property.
2. Copy Google's exact DNS TXT verification value. In Spaceship's DNS manager for this domain, add that TXT record at the domain root, using the root-host notation shown by Spaceship. Preserve every existing record, especially Vercel and mail records. If authoritative DNS is elsewhere, add the record there instead. Never invent a token or put it in this repository.
3. Return to Search Console and verify. DNS propagation may delay verification; retry after the record becomes visible. Keep the verification record afterward.
4. After the reviewed site is published, confirm the three canonical pages, robots.txt and sitemap.xml load successfully over HTTPS at `www.gothoslabs.com`. Check that the sitemap contains only the three intended pages and that the apex still redirects to www. Inspect response headers for unintended indexing restrictions. These are manual production checks, not checks completed by this task.
5. In the property's Sitemaps report, submit `https://www.gothoslabs.com/sitemap.xml`. Check its processing status and any errors.
6. Use URL Inspection for `https://www.gothoslabs.com/`, `https://www.gothoslabs.com/elogbook.html` and `https://www.gothoslabs.com/arogya.html`. Inspect the indexed result and Google's selected canonical. If needed, run the live test and request indexing when eligible. A successful live test or indexing request does not guarantee inclusion.
7. Monitor Page indexing for exclusions and Performance for impressions/clicks on queries such as "gothos labs". Results vary by query and location. Search Console data may be delayed; avoid repeated requests as a substitute for diagnosing a reported issue.

## What the files do

- `robots.txt` allows crawling and advertises the sitemap. It is public guidance, not protection for internal files. Deployment exclusions remain responsible for keeping those files off the public site.
- `sitemap.xml` lists only the homepage and two product pages, using absolute HTTPS www URLs. No modification dates are guessed.
- Each page's canonical and Open Graph URL use the same public address. Canonical declarations are signals; Google may choose another URL. Open Graph fields provide sharing metadata, not a ranking promise.
- The homepage Organization JSON-LD identifies only the existing name, URL and logo. It adds no ratings, contact details or clinical claims.
- The existing logo is reused for sharing. Individual services may crop it or apply their own preview requirements; no new social artwork was generated.

## Official references

- [Google: verify ownership](https://support.google.com/webmasters/answer/9008080)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
