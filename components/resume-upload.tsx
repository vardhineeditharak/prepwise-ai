"use client";

import { useState, useRef, useCallback } from "react";

interface ResumeData {
  text: string;
  markdown: string;
  imageUrl: string;
}

export function ResumeUpload({ onUpload }: { onUpload: (data: ResumeData) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPDF = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      const markdown = convertToMarkdown(fullText);

      const canvas = document.createElement("canvas");
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      await firstPage.render(renderContext).promise;

      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);

      onUpload({ text: fullText, markdown, imageUrl });
    } catch (err) {
      console.error("PDF processing error:", err);
      setError("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === "application/pdf") {
        processPDF(file);
      } else {
        setError("Please upload a PDF file.");
      }
    },
    [processPDF]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file?.type === "application/pdf") {
        processPDF(file);
      } else {
        setError("Please upload a PDF file.");
      }
    },
    [processPDF]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200
          ${isDragging
            ? "border-rust bg-apricot-wash"
            : "border-dove bg-fog hover:border-graphite hover:bg-pure-white"
          }
          ${isProcessing ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <phantom-ui loading animation="pulse" duration={1}>
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-dove/30" />
                <div className="h-5 w-48 rounded-lg bg-dove/20" />
                <div className="h-4 w-36 rounded-lg bg-dove/20" />
              </div>
            </phantom-ui>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <svg
              className="h-12 w-12 text-graphite"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="text-body-lg font-medium text-ink">
                Drop your resume here
              </p>
              <p className="text-caption text-graphite mt-1">
                or click to browse — PDF files only
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-caption text-red-600">{error}</p>
      )}
    </div>
  );
}

function convertToMarkdown(text: string): string {
  const lines = text.split("\n").filter((l) => l.trim());
  let md = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|SUMMARY|OBJECTIVE|CONTACT)/i.test(trimmed)) {
      md += `\n## ${trimmed}\n\n`;
    } else if (/^\d{4}\s*[-–]\s*(\d{4}|Present)/i.test(trimmed)) {
      md += `**${trimmed}**\n`;
    } else if (/^[•●▪]\s*/.test(trimmed)) {
      md += `- ${trimmed.replace(/^[•●▪]\s*/, "")}\n`;
    } else {
      md += `${trimmed}\n`;
    }
  }

  return md.trim();
}
