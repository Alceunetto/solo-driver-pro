import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStudents } from "@/hooks/useStudents";

interface StudentComboboxProps {
  value: string; // student id
  onSelect: (studentId: string, studentName: string) => void;
  onAddNew?: () => void;
}

export function StudentCombobox({ value, onSelect, onAddNew }: StudentComboboxProps) {
  const [open, setOpen] = useState(false);
  const { students, isLoading } = useStudents();

  const activeStudents = students.filter((s) => s.status === "active");
  const selectedStudent = activeStudents.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal text-sm"
        >
          {selectedStudent ? (
            <span className="truncate">{selectedStudent.name}</span>
          ) : (
            <span className="text-muted-foreground">Selecione um aluno...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar aluno..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                <CommandGroup heading="Alunos ativos">
                  {activeStudents.map((student) => (
                    <CommandItem
                      key={student.id}
                      value={student.name}
                      onSelect={() => {
                        onSelect(student.id, student.name);
                        setOpen(false);
                      }}
                      className="min-h-[44px]"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === student.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{student.name}</span>
                      {student.category && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Cat. {student.category}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {onAddNew && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onAddNew();
                      setOpen(false);
                    }}
                    className="min-h-[44px] text-primary"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar novo aluno
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
