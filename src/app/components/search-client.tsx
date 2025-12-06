// components/ui/search-client-debounced.tsx (opcional - com use-debounce)
"use client";

import { Search } from "lucide-react";
import { usePathname,useRouter, useSearchParams } from "next/navigation";
import { useEffect,useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchClientProps {
  placeholder?: string;
  paramName?: string;
  debounceTime?: number;
}

export function SearchClient({ 
  placeholder, 
  paramName = "search",
  debounceTime = 300 
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentSearch = searchParams.get(paramName) || "";
  const [searchValue, setSearchValue] = useState(currentSearch);

  // Detectar qual página estamos para definir placeholder padrão
  const getDefaultPlaceholder = () => {
    if (pathname.includes("/colaboradores")) {
      return "Buscar por nome, email ou matrícula...";
    }
    if (pathname.includes("/emprestimos")) {
      return "Buscar por colaborador, EPI ou código...";
    }
    if (pathname.includes("/epis")) {
      return "Buscar por nome, categoria ou descrição...";
    }
    return "Buscar...";
  };

  const defaultPlaceholder = getDefaultPlaceholder();

  // Atualiza o input quando os params mudam
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term.trim()) {
      params.set(paramName, term.trim());
    } else {
      params.delete(paramName);
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, debounceTime);

  const handleChange = (value: string) => {
    setSearchValue(value);
    handleSearch(value);
  };

  const handleClear = () => {
    setSearchValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch.cancel(); // Cancela o debounce pendente
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchValue.trim()) {
        params.set(paramName, searchValue.trim());
      } else {
        params.delete(paramName);
      }
      
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder || defaultPlaceholder}
        value={searchValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-full pl-9 pr-10 sm:w-[300px]"
      />
      {currentSearch && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
          onClick={handleClear}
        >
          Limpar
        </Button>
      )}
    </div>
  );
}