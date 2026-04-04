const MAX_PDF_SIZE_BYTES = 12 * 1024 * 1024;

export type UploadPdfResponse = {
  filePath: string;
  originalFileName: string;
  reportText: string;
};

type UploadPdfRequestBody = {
  fileName: string;
  mimeType: string;
  dataBase64: string;
};

export async function uploadPdfToServer(file: File): Promise<UploadPdfResponse> {
  validatePdfFile(file);

  const dataBase64 = await readFileAsBase64(file);
  const payload: UploadPdfRequestBody = {
    fileName: file.name,
    mimeType: file.type || "application/pdf",
    dataBase64,
  };

  const response = await fetch("/api/uploads/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Upload failed. Please try again.";
    throw new Error(message);
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("filePath" in parsed) ||
    !("originalFileName" in parsed) ||
    !("reportText" in parsed) ||
    typeof parsed.filePath !== "string" ||
    typeof parsed.originalFileName !== "string" ||
    typeof parsed.reportText !== "string"
  ) {
    throw new Error("Invalid upload response from server.");
  }

  return {
    filePath: parsed.filePath,
    originalFileName: parsed.originalFileName,
    reportText: parsed.reportText,
  };
}

export async function deleteUploadedPdfFromServer(filePath: string): Promise<void> {
  if (!filePath || !filePath.trim()) {
    throw new Error("Missing uploaded file path.");
  }

  const response = await fetch(`/api/uploads/pdf?filePath=${encodeURIComponent(filePath)}`, {
    method: "DELETE",
  });

  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Failed to remove uploaded PDF.";
    throw new Error(message);
  }
}

function validatePdfFile(file: File): void {
  if (!file) {
    throw new Error("No file selected.");
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".pdf")) {
    throw new Error("Please select a PDF file.");
  }

  if (file.size <= 0) {
    throw new Error("Selected file is empty.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("PDF is too large. Maximum allowed size is 12 MB.");
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read selected file."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to process file data."));
        return;
      }

      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };

    reader.readAsDataURL(file);
  });
}
