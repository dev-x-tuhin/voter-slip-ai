import React, { useState } from 'react';
import { VoterInfo } from '../types';

interface ResultCardProps {
  results: VoterInfo[];
}

interface FieldConfig {
  key: keyof VoterInfo;
  label: string;
  sortable?: boolean;
  minWidth?: string;
}

// Updated configuration: Increased min-widths for better Bengali text accommodation
const FIELD_CONFIG: FieldConfig[] = [
    { key: 'name', label: 'Full Name', sortable: true, minWidth: 'min-w-[200px]' },
    { key: 'voterId', label: 'Voter ID', sortable: true, minWidth: 'min-w-[160px]' },
    { key: 'slNo', label: 'Serial No.', sortable: true, minWidth: 'min-w-[120px]' },
    { key: 'fatherOrHusbandName', label: 'Father Name', sortable: true, minWidth: 'min-w-[200px]' },
    { key: 'address', label: 'Address', sortable: true, minWidth: 'min-w-[280px]' },
];

const CopyButton = ({ text, className = "", iconClass = "text-gray-400" }: { text: string, className?: string, iconClass?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${className} ${copied ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            title="Copy to clipboard"
            type="button"
        >
            {copied ? (
                <span className="text-[10px] font-bold px-1">COPIED</span>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${iconClass}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                </svg>
            )}
        </button>
    );
};

export const ResultCard: React.FC<ResultCardProps> = ({ results }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof VoterInfo; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: keyof VoterInfo) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = React.useMemo(() => {
    if (!sortConfig) return results;
    return [...results].sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [results, sortConfig]);

  // Helper to ensure text is Normalized to NFC for correct Bengali rendering
  const safeVal = (val: any) => {
      if (!val) return '-';
      return String(val).normalize('NFC');
  };

  const handlePrint = (data: VoterInfo) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voter Information Slip - ${data.name || 'Details'}</title>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            @page { size: A4; margin: 0; }
            body { 
                font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Bangla', sans-serif; 
                margin: 0;
                padding: 40px;
                background: #fff;
                color: #000;
                -webkit-print-color-adjust: exact;
            }
            .slip-container {
                max-width: 700px;
                margin: 0 auto;
                border: 2px solid #000;
                padding: 0;
                position: relative;
                overflow: hidden;
            }
            .header {
                background: #f0f0f0;
                border-bottom: 2px solid #000;
                padding: 15px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 5px 0 0;
                font-size: 14px;
                font-weight: 500;
            }
            .content {
                padding: 20px;
                position: relative;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 80px;
                font-weight: 900;
                color: rgba(0,0,0,0.05);
                z-index: 0;
                pointer-events: none;
                white-space: nowrap;
                text-transform: uppercase;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0;
                border: 1px solid #000;
                position: relative;
                z-index: 1;
                background: transparent;
            }
            .info-item {
                display: flex;
                flex-direction: column;
                padding: 10px 15px;
                border-bottom: 1px solid #000;
                border-right: 1px solid #000;
            }
            .info-item:nth-child(2n) {
                border-right: none;
            }
            /* Make address take full width */
            .info-item.full-width {
                grid-column: 1 / -1;
                border-right: none;
            }
            .info-item:last-child {
                border-bottom: none;
            }
            .label {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                color: #555;
                margin-bottom: 4px;
            }
            .value {
                font-size: 16px;
                font-weight: 600;
                line-height: 1.4;
                min-height: 22px;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 11px;
                color: #444;
                border-top: 1px dashed #999;
                padding-top: 10px;
            }
            .sl-box {
                background: #000;
                color: #fff;
                display: inline-block;
                padding: 2px 8px;
                border-radius: 2px;
                font-weight: bold;
                font-size: 14px;
            }
        </style>
      </head>
      <body>
        <div class="slip-container">
            <div class="header">
                <h1>Bangladesh Election Commission</h1>
                <p>Voter Information Slip</p>
            </div>
            
            <div class="content">
                <div class="watermark">VOTER INFO</div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Voter ID / NID</span>
                        <span class="value" style="font-size: 18px;">${safeVal(data.voterId)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Serial No (SL)</span>
                        <span class="value"><span class="sl-box">${safeVal(data.slNo)}</span></span>
                    </div>

                    <div class="info-item">
                        <span class="label">Name</span>
                        <span class="value">${safeVal(data.name)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Father/Husband Name</span>
                        <span class="value">${safeVal(data.fatherOrHusbandName)}</span>
                    </div>

                    <div class="info-item">
                        <span class="label">Age</span>
                        <span class="value">${safeVal(data.age)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Gender</span>
                        <span class="value">${safeVal(data.gender)}</span>
                    </div>
                    
                    <div class="info-item full-width">
                        <span class="label">Address</span>
                        <span class="value">${safeVal(data.address)}</span>
                    </div>
                    
                    <div class="info-item full-width" style="border-bottom:none;">
                        <span class="label">Polling Station</span>
                        <span class="value">${safeVal(data.pollingStation)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>This is a computer-generated slip for information purposes only.</p>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        </div>
        <script>
            window.onload = () => { setTimeout(() => { window.print(); }, 500); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8 animate-fade-in-up">
        
        {/* Mobile View - Card Layout (Visible on small screens) */}
        <div className="md:hidden">
            {sortedResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">
                    No data available to display
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {sortedResults.map((item, idx) => (
                        <div key={item.voterId || idx} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
                            {/* Card Content */}
                            <div className="space-y-3">
                                {FIELD_CONFIG.map(field => (
                                    <div key={field.key} className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                            {field.label}
                                        </span>
                                        <div className="flex items-start justify-between gap-3">
                                            <span 
                                                className="text-[15px] font-medium text-gray-900 font-bengali leading-7 break-words"
                                                style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}
                                            >
                                                {safeVal(item[field.key])}
                                            </span>
                                            {item[field.key] && (
                                                <div className="shrink-0 mt-0.5">
                                                    <CopyButton text={safeVal(item[field.key])} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Card Actions */}
                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                <button 
                                    onClick={() => handlePrint(item)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                    </svg>
                                    Print Slip
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Desktop View - Table Layout (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {FIELD_CONFIG.map(field => (
                            <th 
                                key={field.key}
                                onClick={() => handleSort(field.key)}
                                className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group select-none ${field.minWidth || ''}`}
                            >
                                <div className="flex items-center gap-1">
                                    {field.label}
                                    <span className={`transition-opacity duration-200 ${sortConfig?.key === field.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                        {sortConfig?.key === field.key && sortConfig.direction === 'desc' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600">
                                                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${sortConfig?.key === field.key ? 'text-green-600' : 'text-gray-400'}`}>
                                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            </th>
                        ))}
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[100px]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedResults.map((item, idx) => (
                        <tr key={item.voterId || idx} className="hover:bg-gray-50 transition-colors">
                            {FIELD_CONFIG.map(field => (
                                <td key={field.key} className="px-6 py-4 text-base text-gray-900 align-top">
                                    <div className="flex items-start gap-2">
                                        <span 
                                            className="font-bengali font-medium leading-7" 
                                            title={item[field.key]?.toString()}
                                            style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" }}
                                        >
                                            {safeVal(item[field.key])}
                                        </span>
                                        {item[field.key] && (
                                            <div className="mt-1 shrink-0">
                                                <CopyButton text={safeVal(item[field.key])} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                <button 
                                    onClick={() => handlePrint(item)}
                                    className="text-green-600 hover:text-green-900 flex items-center justify-end gap-1 ml-auto mt-1"
                                    title="Print Slip"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                    </svg>
                                    Print
                                </button>
                            </td>
                        </tr>
                    ))}
                    {sortedResults.length === 0 && (
                        <tr>
                            <td colSpan={FIELD_CONFIG.length + 1} className="px-6 py-10 text-center text-gray-500 italic">
                                No data available to display
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};