sed -i 's/process.env.BUNNY_STREAM_LIBRARY_ID || ""/process.env.BUNNY_STREAM_LIBRARY_ID || "698776"/g' src/lib/BunnyStreamService.ts
sed -i 's/process.env.BUNNY_STREAM_API_KEY || ""/process.env.BUNNY_STREAM_API_KEY || "b89fbb62-a0ab-43d4-9ad766000a89-9651-4a36"/g' src/lib/BunnyStreamService.ts
sed -i 's/process.env.BUNNY_STREAM_CDN_HOSTNAME || ""/process.env.BUNNY_STREAM_CDN_HOSTNAME || "vz-758d93f4-d56.b-cdn.net"/g' src/lib/BunnyStreamService.ts

sed -i 's/const bunnyZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;/const bunnyZoneName = process.env.BUNNY_STORAGE_ZONE_NAME || "nndara-files";/g' src/lib/StorageService.ts
sed -i 's/const bunnyPassword = process.env.BUNNY_STORAGE_PASSWORD;/const bunnyPassword = process.env.BUNNY_STORAGE_PASSWORD || "b89fbb62-a0ab-43d4-9ad766000a89-9651-4a36";/g' src/lib/StorageService.ts

sed -i 's/const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;/const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "698776";/g' server.ts
sed -i 's/const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "iframe.mediadelivery.net";/const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "vz-758d93f4-d56.b-cdn.net";/g' server.ts
