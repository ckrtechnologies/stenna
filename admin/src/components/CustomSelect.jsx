import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * CustomSelect — CKR In-DOM Select Dropdown
 * Completely eliminates OS-native (e.g. macOS Aqua) dropdown popovers.
 * 
 * Props:
 * - value: Current selected value (string or number)
 * - onChange: Callback (val) => void
 * - options: Array of { value, label, subtext?, badge? } or strings
 * - placeholder: Default text when value is empty
 * - searchable: Boolean (default: true if options.length > 6)
 * - searchPlaceholder: Placeholder for search box (default: 'Search...')
 * - disabled: Boolean
 * - style: Container inline styles
 * - triggerStyle: Trigger button inline styles
 * - menuStyle: Dropdown menu inline styles
 * - className: Extra class on container
 * - size: 'sm' | 'md' (default 'md')
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = '-- Select an option --',
  searchable,
  searchPlaceholder = 'Search...',
  disabled = false,
  style = {},
  triggerStyle = {},
  menuStyle = {},
  className = '',
  size = 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options into consistent shape: { value, label, subtext, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label !== undefined ? opt.label : (opt.name || opt.shop_name || String(opt.value ?? opt.id)),
        subtext: opt.subtext || (opt.contact_person ? `${opt.contact_person} • ${opt.phone || ''}` : opt.phone) || '',
        badge: opt.badge || opt.code || ''
      };
    }
    return {
      value: opt,
      label: String(opt),
      subtext: '',
      badge: ''
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Determine if searchable
  const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 6;

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const lMatch = (opt.label || '').toLowerCase().includes(q);
    const sMatch = (opt.subtext || '').toLowerCase().includes(q);
    const bMatch = (opt.badge || '').toLowerCase().includes(q);
    return lMatch || sMatch || bMatch;
  });

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const isSelected = value !== undefined && value !== null && value !== '' && value !== 'ALL';

  return (
    <div
      ref={containerRef}
      className={`ckr-custom-select-wrap ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="ckr-custom-select-trigger"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: size === 'sm' ? '0.45rem 0.65rem' : '0.6rem 0.75rem',
          background: 'var(--bg-main, #f8fafc)',
          color: 'var(--text-main)',
          border: isOpen
            ? '1px solid var(--primary)'
            : isSelected
            ? '1px solid var(--primary)'
            : '1px solid var(--border-color)',
          borderRadius: '0.375rem',
          fontSize: size === 'sm' ? '0.8rem' : '0.85rem',
          fontWeight: isSelected ? 600 : 400,
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
          opacity: disabled ? 0.6 : 1,
          ...triggerStyle
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            color: 'var(--text-muted)',
            flexShrink: 0
          }}
        />
      </button>

      {/* In-DOM Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="ckr-custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '240px',
            maxWidth: '460px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1050,
            overflow: 'hidden',
            animation: 'ckrSelectFadeIn 0.15s ease-out',
            ...menuStyle
          }}
        >
          {/* Search Header (if searchable) */}
          {isSearchable && (
            <div
              style={{
                padding: '0.5rem 0.65rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--bg-header-bar, var(--bg-card))'
              }}
            >
              <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  padding: '0.2rem 0'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex'
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '0.25rem 0'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem'
                }}
              >
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isItemActive = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    className="ckr-custom-select-option"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.55rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.83rem',
                      color: isItemActive ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isItemActive ? 600 : 400,
                      background: isItemActive ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isItemActive) {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isItemActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '0.25rem',
                              background: 'var(--bg-hover)',
                              color: 'var(--text-muted)',
                              fontWeight: 500,
                              flexShrink: 0
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subtext && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.1rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isItemActive && (
                      <Check size={14} color="var(--primary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
