import { NextRequest, NextResponse } from "next/server";
import { convert } from "@opendataloader/pdf";
import { writeFile, mkdir, readFile, rm } from "fs/promises";
import path from "path";
import os from "os";

// We injected our downloaded Java into our local workspace path
const JAVA_BIN_PATH = "C:\\Users\\n.gull\\Documents\\PDFParser\\java\\jdk-21.0.10+7\\bin";
process.env.PATH = `${JAVA_BIN_PATH};${process.env.PATH}`;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("pdf") as File;
  const useHybrid = formData.get("useHybrid") === "true";

  if (!file) {
    return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
  }

  // Create a strict temporary directory
  const tempDir = path.join(os.tmpdir(), `pdf-parser-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  const inputPath = path.join(tempDir, file.name);
  const outDir = path.join(tempDir, "output");
  await mkdir(outDir, { recursive: true });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save the uploaded file block
    await writeFile(inputPath, buffer);

    // Call opendataloader-pdf convert function
    console.log(`Starting PDF conversion for: ${inputPath} (Hybrid: ${useHybrid})`);
    
    const config: any = {
      outputDir: outDir,
      format: "markdown,json"
    };

    if (useHybrid) {
      config.hybrid = "docling-fast";
    }

    await convert([inputPath], config);

    // Read the results
    const baseName = path.basename(inputPath, ".pdf");
    
    let markdownContent = "No markdown found";
    let jsonContent = "No JSON found";
    
    try {
      markdownContent = await readFile(path.join(outDir, `${baseName}.md`), "utf-8");
    } catch(e) {}
    
    try {
      jsonContent = await readFile(path.join(outDir, `${baseName}.json`), "utf-8");
      // Format the JSON strictly by parsing and restringing
      jsonContent = JSON.stringify(JSON.parse(jsonContent), null, 2);
    } catch(e) {}

    // Cleanup async
    rm(tempDir, { recursive: true, force: true }).catch(console.error);

    return NextResponse.json({
      markdown: markdownContent,
      json: jsonContent
    });

  } catch (error: any) {
    console.error("Conversion error:", error);
    // Cleanup async
    rm(tempDir, { recursive: true, force: true }).catch(console.error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
  }
}
