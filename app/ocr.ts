import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import "dotenv/config";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_KEY,
});

const prompt =
  "Extract data from this invoice: vendor Name, business ID (Y-Tunnus), vendor VAT number";

const invoiceSchema = z.object({
  name: z.string().describe("Name of the ingredient."),
  quantity: z.string().describe("Quantity of the ingredient, including units."),
});

const contents = [
  { text: prompt },
  {
    inlineData: {
      mimeType: "application/pdf",
      data: fs
        .readFileSync(
          "/home/suryakiran/Documents/studies/software engineering 2/software-engineering-2-ahjs/invoice december.pdf",
        )
        .toString("base64"),
    },
  },
];

const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: contents,
  config: {
    responseMimeType: "application/json",
    responseJsonSchema: zodToJsonSchema(invoiceSchema),
  },
});

console.log(response.text);
