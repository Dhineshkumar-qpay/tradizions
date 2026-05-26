"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: any;
}

interface SearchableDropdownProps {
  options: (string | DropdownOption)[];
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (opt: string | DropdownOption) => typeof opt === "string" ? opt : opt.label;
  const getValue = (opt: string | DropdownOption) => typeof opt === "string" ? opt : opt.value;

  const filteredOptions = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabel = options.find((opt) => getValue(opt) === value) 
    ? getLabel(options.find((opt) => getValue(opt) === value)!)
    : value; // Fallback to value itself

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`w-full border border-stone-200 rounded-xl py-3.5 px-4 flex justify-between items-center transition-all ${
          disabled
            ? "bg-stone-50 text-stone-400 cursor-not-allowed"
            : "bg-white cursor-pointer focus:ring-2 focus:ring-[var(--olive)]/20 focus:border-[var(--olive)]"
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm("");
          }
        }}
      >
        <span
          className={
            value && !disabled
              ? "text-stone-800 text-sm font-bold truncate"
              : disabled
              ? "text-stone-400 text-sm font-medium truncate"
              : "text-stone-400 text-sm font-medium truncate"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-stone-100 bg-stone-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-lg outline-none focus:border-[var(--olive)] bg-white font-medium text-stone-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-stone-500 text-center font-medium">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors font-medium ${
                    value === getValue(opt)
                      ? "bg-[var(--olive)]/10 text-[var(--olive)] font-bold"
                      : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                  onClick={() => {
                    onChange(getValue(opt));
                    setIsOpen(false);
                  }}
                >
                  {getLabel(opt)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
