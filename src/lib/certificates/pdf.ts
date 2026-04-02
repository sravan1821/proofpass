import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { buildCertificateViewData, type CertificateViewRow } from "@/lib/certificates/certificate-view";
import { type CertificateTemplatePlacement } from "@/lib/certificates/fields";

type JsonRecord = Record<string, unknown>;

function placementHeight(placement: CertificateTemplatePlacement) {
  if (placement.kind === "qr") return placement.height ?? placement.width;
  if (placement.kind === "image") return placement.height ?? placement.width * 0.56;
  return placement.height ?? 0.09;
}

function parseHexColor(input?: string | null) {
  const value = String(input || "").trim();
  const normalized = value.startsWith("#") ? value.slice(1) : value;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return rgb(0.11, 0.16, 0.31);
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

async function readAssetSource(source: string) {
  if (source.startsWith("data:")) {
    const match = source.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;

    return {
      contentType: match[1],
      buffer: Buffer.from(match[2], "base64"),
    };
  }

  if (source.startsWith("/")) {
    const filePath = path.join(process.cwd(), "public", source.replace(/^\/+/, "").replaceAll("/", path.sep));
    const buffer = await readFile(filePath);
    const lower = source.toLowerCase();
    const contentType = lower.endsWith(".pdf")
      ? "application/pdf"
      : lower.endsWith(".png")
        ? "image/png"
        : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
          ? "image/jpeg"
          : "";

    if (!contentType) return null;

    return { contentType, buffer };
  }

  return null;
}

async function embedImageFromSource(pdfDoc: PDFDocument, source: string) {
  const resolved = await readAssetSource(source);
  if (!resolved) return null;

  if (resolved.contentType === "image/png") {
    return pdfDoc.embedPng(resolved.buffer);
  }

  if (resolved.contentType === "image/jpeg") {
    return pdfDoc.embedJpg(resolved.buffer);
  }

  return null;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let currentLine = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${currentLine} ${word}`;
      if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
  }

  return lines;
}

function drawTextPlacement(
  page: PDFPage,
  placement: CertificateTemplatePlacement,
  value: string,
  regularFont: PDFFont,
  boldFont: PDFFont,
) {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const boxWidth = placement.width * pageWidth;
  const boxHeight = placementHeight(placement) * pageHeight;
  const left = placement.x * pageWidth;
  const top = placement.y * pageHeight;
  const bottom = pageHeight - top - boxHeight;
  const fontSize = Math.max(9, (placement.fontSize ?? 0.024) * pageWidth);
  const font = placement.bold ? boldFont : regularFont;
  const lines = wrapText(String(value || ""), font, fontSize, boxWidth);
  const lineHeight = fontSize * 1.15;
  const totalHeight = lines.length * lineHeight;
  let currentY = bottom + Math.max(0, (boxHeight - totalHeight) / 2) + totalHeight - fontSize;

  for (const line of lines) {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);
    let x = left;

    if (placement.align === "center") {
      x = left + (boxWidth - lineWidth) / 2;
    } else if (placement.align === "right") {
      x = left + boxWidth - lineWidth;
    }

    page.drawText(line, {
      x,
      y: currentY,
      font,
      size: fontSize,
      color: parseHexColor(placement.color),
    });
    currentY -= lineHeight;
  }
}

async function drawImagePlacement(page: PDFPage, pdfDoc: PDFDocument, placement: CertificateTemplatePlacement, source: string) {
  const image = await embedImageFromSource(pdfDoc, source);
  if (!image) return;

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const width = placement.width * pageWidth;
  const height = placementHeight(placement) * pageHeight;
  const x = placement.x * pageWidth;
  const y = pageHeight - placement.y * pageHeight - height;

  page.drawImage(image, {
    x,
    y,
    width,
    height,
  });
}

export async function generateCertificatePdf(params: {
  certificate: CertificateViewRow;
  event?: JsonRecord | null;
  organizationName?: string | null;
}) {
  const { template, fieldValues } = buildCertificateViewData({
    certificate: params.certificate,
    event: params.event,
    organizationName: params.organizationName,
  });

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const assetSource = template.assetDataUrl ?? template.pdfDataUrl;

  let page: PDFPage;

  if (assetSource) {
    const resolvedAsset = await readAssetSource(assetSource);

    if (resolvedAsset?.contentType === "application/pdf") {
      const sourcePdf = await PDFDocument.load(resolvedAsset.buffer);
      const [copiedPage] = await pdfDoc.copyPages(sourcePdf, [0]);
      page = pdfDoc.addPage(copiedPage);
    } else {
      const image = await embedImageFromSource(pdfDoc, assetSource);
      if (!image) {
        throw new Error("Unsupported certificate template asset format.");
      }

      const dimensions = image.scale(1);
      page = pdfDoc.addPage([dimensions.width, dimensions.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height,
      });
    }
  } else {
    page = pdfDoc.addPage([1275, 901]);
  }

  for (const placement of template.layout?.placements ?? []) {
    const rawValue = fieldValues[placement.sourceKey];
    if (!rawValue) continue;

    if (placement.kind === "text") {
      drawTextPlacement(page, placement, rawValue, regularFont, boldFont);
      continue;
    }

    if (placement.kind === "qr" || placement.kind === "image") {
      if (rawValue.startsWith("data:image") || rawValue.startsWith("/")) {
        await drawImagePlacement(page, pdfDoc, placement, rawValue);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const certificateId = params.certificate.certificate_id_display || params.certificate.id || "certificate";

  return {
    filename: `${certificateId}.pdf`,
    buffer: Buffer.from(pdfBytes),
  };
}
