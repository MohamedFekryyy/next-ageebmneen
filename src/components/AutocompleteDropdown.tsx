"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, ChevronDown } from 'lucide-react';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { cn } from '@/lib/utils';

interface AutocompleteSuggestion {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  brand?: string;
  category?: string;
}

interface AutocompleteDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AutocompleteSuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AutocompleteDropdown({
  value,
  onChange,
  onSelect,
  placeholder = "ابحث عن جهازك...",
  className,
  disabled = false
}: AutocompleteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    suggestions,
    isLoading,
    error,
    search,
    clearSuggestions,
    getCategoryIcon,
    getCategoryLabel
  } = useAutocomplete();

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim().length >= 2) {
      search(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
    
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.title);
    setIsOpen(false);
    setSelectedIndex(-1);
    clearSuggestions();
    
    if (onSelect) {
      onSelect(suggestion);
    }
    
    // Focus back to input
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && value.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative w-full">
      {/* Input with search icon */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length >= 2 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={cn("text-right pr-4 pl-10", className)}
          disabled={disabled}
          aria-label="البحث عن المنتجات"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {/* Search icon or loading spinner */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Dropdown indicator */}
        {suggestions.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform",
              isOpen && "rotate-180"
            )} />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                  selectedIndex === index 
                    ? "bg-blue-50 border-blue-200" 
                    : "hover:bg-gray-50"
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
                role="option"
                aria-selected={selectedIndex === index}
              >
                {/* Product image or icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {suggestion.image ? (
                    <img
                      src={suggestion.image}
                      alt={suggestion.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={cn(
                    "text-lg",
                    suggestion.image && "hidden"
                  )}>
                    {getCategoryIcon(suggestion.category)}
                  </span>
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.title}
                  </div>
                  
                  {suggestion.brand && (
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.brand}
                    </div>
                  )}
                  
                  {suggestion.description && (
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {suggestion.description}
                    </div>
                  )}
                </div>

                {/* Category badge */}
                {suggestion.category && (
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(suggestion.category)}
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 z-40 mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-right"
        >
          {error}
        </motion.div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && !error && suggestions.length === 0 && value.trim().length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 z-40 mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 text-right"
        >
          لا توجد نتائج لـ &quot;{value}&quot;
        </motion.div>
      )}
    </div>
  );
} 