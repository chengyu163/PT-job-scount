"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  name: string;
  slug: string;
  hasReport: boolean;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const dropdownRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchSuggestions(q: string) {
    try {
      const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch {
      // ignore
    }
  }

  function navigate(name: string) {
    setLoading(true);
    setShowDropdown(false);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    router.push(`/company/${slug}?name=${encodeURIComponent(name)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      const s = suggestions[selectedIdx];
      setQuery(s.name);
      navigate(s.name);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setSelectedIdx(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="输入公司名称..."
          className="w-full rounded-full border border-zinc-300 bg-white px-6 py-4 text-lg shadow-sm outline-none transition-shadow focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-blue-800"
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "搜索中..." : "开始调查"}
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              className={`flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                i === selectedIdx ? "bg-zinc-100 dark:bg-zinc-800" : ""
              }`}
              onMouseDown={() => {
                setQuery(s.name);
                navigate(s.name);
              }}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {s.name}
              </span>
              {s.hasReport && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  已有报告
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
