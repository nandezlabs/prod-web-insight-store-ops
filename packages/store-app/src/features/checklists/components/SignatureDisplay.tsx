/**
 * SignatureDisplay Component
 *
 * Displays a signature image from base64 data URL.
 * Shows proper aspect ratio and provides download option.
 */

import { Download } from "lucide-react";

interface SignatureDisplayProps {
  signatureData: string; // Base64 data URL
  showDownload?: boolean;
}

export function SignatureDisplay({
  signatureData,
  showDownload = false,
}: SignatureDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = signatureData;
    link.download = `signature-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2">
      <div className="relative bg-white border-2 border-gray-300 rounded-lg p-4">
        <img
          src={signatureData}
          alt="Signature"
          className="w-full h-auto max-h-32 object-contain"
        />

        {showDownload && (
          <button
            onClick={handleDownload}
            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            aria-label="Download signature"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">Digital signature</p>
    </div>
  );
}
