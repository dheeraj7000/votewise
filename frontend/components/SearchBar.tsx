'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Vote, Tag, ChevronRight, X, Loader2 } from 'lucide-react';
import { searchElection } from '@/services/api';
import { SearchResultItem } from '@/types/election';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search candidate, office, ballot measure, or policy topic...',
  className = '',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    candidates: SearchResultItem[];
    measures: SearchResultItem[];
    topics: any[];
  }>({ candidates: [], measures: [], topics: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ candidates: [], measures: [], topics: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchElection(query);
        setResults({
          candidates: data.candidates || [],
          measures: data.measures || [],
          topics: data.topics || [],
        });
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = results.candidates.length + results.measures.length + results.topics.length;

  const handleSelect = (item: any, type: 'candidate' | 'measure' | 'topic') => {
    setIsOpen(false);
    setQuery('');
    if (type === 'candidate') {
      router.push(`/candidate/${item.id}`);
    } else if (type === 'measure') {
      router.push(`/measure/${item.id}`);
    } else if (type === 'topic') {
      router.push(`/?topic=${item.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-[460px] overflow-y-auto"
          role="listbox"
        >
          {totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No verified election records matching "{query}".
              <div className="text-xs text-slate-400 mt-1">
                Try searching for candidate name, office, or proposition.
              </div>
            </div>
          ) : (
            <div className="py-2 divide-y divide-slate-100">
              {/* Candidates */}
              {results.candidates.length > 0 && (
                <div className="px-3 py-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 px-2">
                    Candidates & Public Officials
                  </div>
                  {results.candidates.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c, 'candidate')}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left transition-colors text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-500">
                            {c.office} • {c.party}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Ballot Measures */}
              {results.measures.length > 0 && (
                <div className="px-3 py-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 px-2">
                    Certified Ballot Measures
                  </div>
                  {results.measures.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m, 'measure')}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left transition-colors text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                          <Vote className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{m.number}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                            {m.title}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Topics */}
              {results.topics.length > 0 && (
                <div className="px-3 py-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1 px-2">
                    Election Policy Topics
                  </div>
                  {results.topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelect(t, 'topic')}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50 text-left transition-colors text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                            {t.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
