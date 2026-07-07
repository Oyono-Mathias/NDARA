sed -i 's/const securityKey = process.env.BUNNY_STREAM_SECURITY_KEY;/const securityKey = process.env.BUNNY_STREAM_SECURITY_KEY || "6e4f82a1-72cf-4d99-a850-db8f9c0f0686";/g' server.ts
sed -i 's/let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;/let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "698776";/g' server.ts
