import React, { useState, useEffect, useRef } from 'react';
import { SearchCriteria } from '../types';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  onClear: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, onClear, isLoading, disabled }) => {
  const [mode, setMode] = useState<'smart' | 'advanced'>('smart');
  
  // Smart Search State
  const [smartQuery, setSmartQuery] = useState('');
  
  // Advanced Search State
  const [criteria, setCriteria] = useState<SearchCriteria>({
    voterId: '',
    name: '',
    fatherName: '',
    exactMatchVoterId: false,
    exactMatchName: false
  });

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const handleSmartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSmartQuery(val);
    
    // Auto-search logic (Instant Search)
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    if (val.length > 3 && !disabled && !isLoading) {
      debounceTimeout.current = setTimeout(() => {
        onSearch({ query: val });
      }, 1200); // 1.2s delay for auto-search
    }
  };

  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCriteria(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleClear = () => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    setSmartQuery('');
    setCriteria({
        voterId: '',
        name: '',
        fatherName: '',
        exactMatchVoterId: false,
        exactMatchName: false
    });
    onClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (mode === 'smart') {
        onSearch({ query: smartQuery });
    } else {
        onSearch(criteria);
    }
  };

  // Helper to check if any search has been performed or input entered to show clear button state
  const hasInput = mode === 'smart' ? !!smartQuery : (!!criteria.voterId || !!criteria.name || !!criteria.fatherName);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-8 transition-all duration-300 overflow-hidden">
      
      {/* Tab Navigation */}
      <div className="bg-gray-50/50 border-b border-gray-100 p-2">
        <div className="flex justify-center">
            <div className="bg-gray-200/50 p-1 rounded-xl inline-flex relative">
                <button 
                    type="button" 
                    onClick={() => setMode('smart')}
                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none flex items-center gap-2 ${
                        mode === 'smart' 
                        ? 'bg-white text-green-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM15.657 14.596a.75.75 0 00-1.061 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06zM6.464 5.404a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06z" />
                    </svg>
                    Smart Search
                </button>
                <button 
                    type="button" 
                    onClick={() => setMode('advanced')}
                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none flex items-center gap-2 ${
                        mode === 'advanced' 
                        ? 'bg-white text-green-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
                    </svg>
                    Advanced Filter
                </button>
            </div>
        </div>
      </div>
      
      <div className="p-6">
          <form onSubmit={handleSubmit}>
            {mode === 'smart' ? (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className={`h-6 w-6 transition-colors duration-200 ${smartQuery ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            name="smartQuery"
                            id="smartQuery"
                            value={smartQuery}
                            onChange={handleSmartChange}
                            disabled={disabled || isLoading}
                            placeholder="Enter Name, Voter ID, or Anything..."
                            className="block w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-0 transition-all duration-200 sm:text-lg shadow-sm group-hover:border-gray-200"
                            autoComplete="off"
                        />
                        {isLoading && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <div className="h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-yellow-500">
                                <path fillRule="evenodd" d="M10 1c3.866 0 7 1.798 7 4s-3.134 4-7 4-7-1.798-7-4 3.134-4 7-4zm5.694 8.13c.464-.264.91-.583 1.306-.952V10c0 2.202-3.134 4-7 4s-7-1.798-7-4V8.178c.396.37.842.689 1.306.953C5.838 10.006 7.854 10.5 10 10.5s4.162-.494 5.694-1.37zM3 13.179V15c0 2.202 3.134 4 7 4s7-1.798 7-4v-1.822c-.396.37-.842.689-1.306.953-1.532.875-3.548 1.369-5.694 1.369s-4.162-.494-5.694-1.37A7.009 7.009 0 013 13.179z" clipRule="evenodd" />
                            </svg>
                            powered-AI instant search
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
                    <div className="space-y-1">
                        <label htmlFor="voterId" className="block text-sm font-semibold text-gray-700">
                            Voter ID
                        </label>
                        <input
                            type="text"
                            name="voterId"
                            id="voterId"
                            value={criteria.voterId}
                            onChange={handleAdvancedChange}
                            disabled={disabled || isLoading}
                            
                            className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center pt-1">
                            <label className="inline-flex items-center cursor-pointer group">
                                <input
                                    id="exactMatchVoterId"
                                    name="exactMatchVoterId"
                                    type="checkbox"
                                    checked={criteria.exactMatchVoterId}
                                    onChange={handleAdvancedChange}
                                    disabled={disabled || isLoading || !criteria.voterId}
                                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 disabled:opacity-50"
                                />
                                <span className={`ml-2 text-xs font-medium ${!criteria.voterId ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-800'}`}>Exact Match</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={criteria.name}
                            onChange={handleAdvancedChange}
                            disabled={disabled || isLoading}
                            
                            className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center pt-1">
                             <label className="inline-flex items-center cursor-pointer group">
                                <input
                                    id="exactMatchName"
                                    name="exactMatchName"
                                    type="checkbox"
                                    checked={criteria.exactMatchName}
                                    onChange={handleAdvancedChange}
                                    disabled={disabled || isLoading || !criteria.name}
                                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 disabled:opacity-50"
                                />
                                <span className={`ml-2 text-xs font-medium ${!criteria.name ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-800'}`}>Exact Match</span>
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label htmlFor="fatherName" className="block text-sm font-semibold text-gray-700">
                            Father/Husband Name <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            name="fatherName"
                            id="fatherName"
                            value={criteria.fatherName}
                            onChange={handleAdvancedChange}
                            disabled={disabled || isLoading}
                            
                            className="block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            )}

            <div className="mt-8 flex gap-3 pt-2 border-t border-gray-50">
                {!disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={isLoading}
                        className={`px-5 py-3 border border-gray-200 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200
                            ${isLoading
                                ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                                : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 shadow-sm'}`}
                    >
                        Clear
                    </button>
                )}
                <button
                    type="submit"
                    disabled={disabled || isLoading || (mode === 'smart' ? !smartQuery : (!criteria.voterId && !criteria.name && !criteria.fatherName))}
                    className={`flex-1 flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all duration-200
                        ${disabled || (mode === 'smart' ? !smartQuery : (!criteria.voterId && !criteria.name && !criteria.fatherName))
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 active:transform active:scale-[0.98]'}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Findding...
                        </>
                    ) : mode === 'smart' ? 'Search' : 'Start Search'}
                </button>
            </div>
          </form>
      </div>
    </div>
  );
};