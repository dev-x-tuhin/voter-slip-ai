import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { SearchForm } from './components/SearchForm';
import { ResultCard } from './components/ResultCard';
import { VoterInfo, SearchCriteria, SearchStatus } from './types';
import { searchInVoterSlip } from './services/geminiService';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  const [results, setResults] = useState<VoterInfo[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus(SearchStatus.IDLE);
    setResults([]);
    setErrorMsg('');
  };

  const handleSearch = async (criteria: SearchCriteria) => {
    if (!file) return;

    setStatus(SearchStatus.SEARCHING);
    setErrorMsg('');
    setResults([]);

    try {
      const data = await searchInVoterSlip(file, criteria);
      if (data && data.length > 0) {
        setResults(data);
        setStatus(SearchStatus.FOUND);
      } else {
        setStatus(SearchStatus.NOT_FOUND);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(SearchStatus.ERROR);
      
      let message = "An unexpected error occurred while processing the document.";
      
      // Check specifically for the 429 structure provided by user or standard SDK errors
      const isQuota = 
        err?.status === 429 || 
        err?.code === 429 || 
        err?.error?.code === 429 ||
        err?.status === 'RESOURCE_EXHAUSTED' ||
        (err?.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')));

      if (isQuota) {
          message = "⚠️ System Busy: Daily quota exceeded or rate limit reached. Please wait a moment and try again.";
      } else if (err) {
        if (err.details) {
             message = typeof err.details === 'string' ? err.details : JSON.stringify(err.details);
        } else if (err.message) {
             message = err.message;
        }
      }
      setErrorMsg(message);
    }
  };

  const handleClear = () => {
    setStatus(SearchStatus.IDLE);
    setResults([]);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">বাংলাদেশ নির্বাচন কমিশন</h2>
                    <p className="mt-2 text-gray-600">Upload a voter list or slip (PDF) and search instantly.</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <FileUpload 
                        onFileSelect={handleFileSelect} 
                        selectedFile={file} 
                    />

                    <SearchForm 
                        onSearch={handleSearch} 
                        onClear={handleClear}
                        isLoading={status === SearchStatus.SEARCHING}
                        disabled={!file}
                    />
                </div>
                
                {/* IDLE State Guidance */}
                {status === SearchStatus.IDLE && (
                    <div className="mt-6 animate-fade-in max-w-3xl mx-auto">
                        {!file ? (
                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4 shadow-sm border border-gray-100">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-900 font-medium">Upload a Document to Enable Search</h3>
                                <p className="text-gray-500 text-sm mt-1"> </p>
                            </div>
                        ) : (
                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600 mt-0.5 shrink-0">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-blue-800 font-medium text-sm">Document ready for search</h3>
                                    <p className="text-blue-700 text-sm mt-0.5 opacity-90">Enter a name, Voter ID, or specific details in the form above and click Search to find the record.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {status === SearchStatus.NOT_FOUND && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200 animate-fade-in max-w-3xl mx-auto">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">No matching record found</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>We couldn't find a person matching those details in the uploaded document. Please check the spelling or try a different search field.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === SearchStatus.ERROR && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-200 animate-fade-in max-w-3xl mx-auto">
                         <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{errorMsg}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === SearchStatus.FOUND && results.length > 0 && (
                    <div className="space-y-6 animate-fade-in mt-8">
                         <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                {results.length} {results.length === 1 ? 'Record' : 'Records'} Found
                            </span>
                        </div>
                        <ResultCard results={results} />
                    </div>
                )}
            </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
            <p className="mt-1 text-center text-sm text-gray-500">
                &copy; 2026 Voter Slip AI | Developed By Tuhin Ahmed
            </p>
        </div>
      </footer>

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://api.whatsapp.com/send/?phone=8801873011736&text=Hello+Help+Needed&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        aria-label="Contact Support via WhatsApp"
      >
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Support
        </span>
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
};

export default App;