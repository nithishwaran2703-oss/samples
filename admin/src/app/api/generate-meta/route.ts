import { NextResponse } from 'next/server';

// Fallback rule-based generator for offline/keyless environments
// Uses deterministic hash-based templates to ensure unique metadata is always generated
function generateOfflineMeta(fileName: string, category: string): { title: string; description: string; altText: string } {
  // Clean filename to extract keywords
  const cleanName = fileName
    .split('.')[0]
    .replace(/[-_]/g, ' ')
    .replace(/\d+/g, '')
    .trim();
  
  const keyword = cleanName || category || 'celebration';
  const capKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);

  // High quality templates
  const titles = [
    `Artisanal ${capKeyword} Celebration Pack`,
    `Premium Handcrafted ${capKeyword} Decor Set`,
    `Vibrant Luxury ${capKeyword} Theme Kit`,
    `Charming ${capKeyword} Party Accent Set`,
    `Elite Majestic ${capKeyword} Backdrop Panel`,
    `Sophisticated Festive ${capKeyword} Accent`,
    `Whimsical Shimmering ${capKeyword} Set`,
    `Bespoke Grand ${capKeyword} Styling Kit`
  ];

  const descriptions = [
    `Elevate your special moments with our premium, high-quality ${keyword} supplies. Perfect for creating unforgettable memories with a touch of elegance, vibrant styling, and festive charm.`,
    `A stunning choice for any modern event. Exquisitely styled ${keyword} elements designed to bring a premium, magical atmosphere and a sophisticated feel to your celebrations.`,
    `Add a luxury feel to your party setup with this curated ${keyword} decoration. Highly durable, easy to assemble, and guaranteed to impress your guests and loved ones alike.`,
    `Crafted with meticulous attention to detail, this beautiful ${keyword} centerpiece offers the perfect blend of traditional elegance and modern aesthetic for any premium occasion.`,
    `Transform your celebration space instantly. This designer ${keyword} kit features vibrant color palettes, rich textures, and superior durability, ensuring your event stands out.`
  ];

  const altTexts = [
    `A beautifully arranged ${keyword} decoration set featuring elegant gold accents, rich textures, and bright festive lighting on a clean premium backdrop.`,
    `Close-up detail of a premium ${keyword} styling kit displaying vibrant celebratory colors, high-end materials, and meticulous design elements.`,
    `Showcase view of an exquisite ${keyword} party supply item, highlighting its glossy finish, intricate detailing, and beautiful celebratory theme.`,
    `A high-resolution photograph of the custom ${keyword} celebration prop set against a warm, soft-focus background for a premium, inviting feel.`
  ];

  // Simple deterministic hash of the filename to pick unique templates
  let hash = 0;
  const combined = fileName + category;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // Pick unique indices
  const titleIdx = hash % titles.length;
  const descIdx = (hash + 2) % descriptions.length;
  const altIdx = (hash + 5) % altTexts.length;

  // Add a unique sequential number or suffix based on filename hash to prevent duplicate titles completely
  const suffix = (hash % 899) + 100; // 100-999

  return {
    title: `${titles[titleIdx]} #${suffix}`,
    description: descriptions[descIdx],
    altText: `${altTexts[altIdx]} (Ref: VV-${suffix})`
  };
}

export async function POST(req: Request) {
  try {
    const { image, fileName, category } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.log('No GEMINI_API_KEY found. Using high-quality offline metadata generator.');
      const result = generateOfflineMeta(fileName || 'product_image', category || 'birthday-combo-pack');
      return NextResponse.json(result);
    }

    if (!image) {
      return NextResponse.json({ error: 'Image is required for AI generation.' }, { status: 400 });
    }

    // Extract base64 details
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('http')) {
      const imgRes = await fetch(image);
      const arrayBuffer = await imgRes.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } else if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    // Call Gemini 1.5 Flash API with JSON response schema
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a professional merchandising copywriter for "Vanakkam Vandhanam", a luxury event decoration and party supply brand. 
Analyze this product image and generate three pieces of unique metadata:
1. "title": A unique, highly creative event-focused product name (under 50 characters, e.g. "Chateau Gold Foil Champagne Balloon"). Avoid boring filenames. Make it unique and premium.
2. "description": A captivating, rich marketing description (under 180 characters) detailing why this product is essential for a beautiful party, housewarming, birthday, or celebration.
3. "altText": An descriptive, SEO-optimized image alt text (under 90 characters) outlining the key visual details, materials, and colors shown in the image.

Ensure that the values are randomized, creative, and fully distinct. Do NOT generate identical descriptions or titles across different requests.
Return the output strictly in valid JSON format with keys "title", "description", and "altText". Return ONLY the JSON object, with no markdown formatting.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8, // slightly higher temperature for creative diversity
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error Response:', errText);
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    // Parse the generated JSON response
    const parsedData = JSON.parse(responseText.trim());

    // Fallback guarantees if keys are missing
    const finalResult = {
      title: parsedData.title || generateOfflineMeta(fileName || 'product_image', category || 'birthday-combo-pack').title,
      description: parsedData.description || generateOfflineMeta(fileName || 'product_image', category || 'birthday-combo-pack').description,
      altText: parsedData.altText || generateOfflineMeta(fileName || 'product_image', category || 'birthday-combo-pack').altText
    };

    return NextResponse.json(finalResult);
  } catch (error: any) {
    console.error('Error generating AI metadata:', error);
    // Graceful fallback to offline generator so the app never crashes for the end user!
    const fallback = generateOfflineMeta('fallback_item', 'birthday-combo-pack');
    return NextResponse.json({
      ...fallback,
      title: fallback.title + ' (AI Fallback)',
      _error: error.message
    });
  }
}
