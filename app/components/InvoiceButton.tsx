'use client';

import { FileText, Printer } from 'lucide-react';
import { useState } from 'react';

interface InvoiceButtonProps {
  orderId: string;
  orderNumber: string;
}

export default function InvoiceButton({ orderId, orderNumber }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      // Open invoice in new window
      const invoiceUrl = `/api/orders/${orderId}/invoice`;
      window.open(invoiceUrl, '_blank', 'width=900,height=800');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerateInvoice}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Generating...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <span>Generate Invoice</span>
        </>
      )}
    </button>
  );
}

// Alternative: Simple invoice link component
export function InvoiceLink({ orderId, orderNumber }: InvoiceButtonProps) {
  return (
    <a
      href={`/api/orders/${orderId}/invoice`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <FileText className="w-4 h-4" />
      <span>View Invoice</span>
    </a>
  );
}

// Print invoice directly without opening new window
export function PrintInvoiceButton({ orderId, orderNumber }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePrintInvoice = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      const html = await response.text();
      
      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Write HTML to iframe
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
        
        // Wait for content to load then print
        iframe.onload = () => {
          iframe.contentWindow?.print();
          // Remove iframe after printing
          setTimeout(() => document.body.removeChild(iframe), 1000);
        };
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePrintInvoice}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          <Printer className="w-4 h-4" />
          <span>Print Invoice</span>
        </>
      )}
    </button>
  );
}